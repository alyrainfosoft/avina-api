import {
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../config/env.var";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import { moveFileToLocation } from "../../helpers/file.helper";
import {
  FILE_STATUS,
  FILE_BULK_UPLOAD_TYPE,
  DeletedStatus,
  DIAMOND_TYPE,
  EternityProductCombinationType,
  ActiveStatus,
  AllProductTypes,
  LogsActivityType,
  LogsType,
  PRICE_CORRECTION_PRODUCT_TYPE,
} from "../../utils/app-enumeration";
import {
  FILE_NOT_FOUND,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  DEFAULT_STATUS_CODE_SUCCESS,
  INVALID_HEADER,
  DATA_NOT_FOUND,
  REQUIRED_ERROR_MESSAGE,
  ERROR_NOT_FOUND,
  PRODUCT_NOT_FOUND,
} from "../../utils/app-messages";
import {
  resUnprocessableEntity,
  getLocalDate,
  resUnknownError,
  resSuccess,
  prepareMessageFromParams,
  getInitialPaginationFromQuery,
  resNotFound,
  columnValueLowerCase,
  refreshMaterializedEternityBandConfiguratorPriceFindView,
  getCompanyIdBasedOnTheCompanyKey,
  addActivityLogs,
  refreshMaterializedEternityBandSideBarDataView,
} from "../../utils/shared-functions";
import { Request } from "express";
import {
  CONFIG_PRODUCT_GEMSTONE_DETAILS,
  CONFIG_PRODUCT_DIAMOND_DETAILS,
  CONFIG_PRODUCT_METAL_DETAILS,
} from "../../utils/app-constants";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { initModels } from "../model/index.model";

const readXlsxFile = require("read-excel-file/node");

export const addConfigEternityProduct = async (req: Request) => {
  try {
    const {ProductBulkUploadFile}= initModels(req);
    if (!req.file) {
      return resUnprocessableEntity({
        message: FILE_NOT_FOUND,
      });
    }

    if (req.file.size > PRODUCT_BULK_UPLOAD_FILE_SIZE * 1024 * 1024) {
      return resUnprocessableEntity({
        message: PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
      });
    }

    const resMFTL = moveFileToLocation(
      req.file.filename,
      req.file.destination,
      PRODUCT_CSV_FOLDER_PATH,
      req.file.originalname,
      req
    );

    if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resMFTL;
    }

    const resPBUF = await ProductBulkUploadFile.create({
      file_path: resMFTL.data,
      status: FILE_STATUS.Uploaded,
      file_type: FILE_BULK_UPLOAD_TYPE.ConfigProductUpload,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
      created_date: getLocalDate(),
    });

    const PPBUF = await processProductBulkUploadFile(
      resPBUF.dataValues.id,
      resMFTL.data,
      req.body.session_res.id_app_user,
      req?.body?.session_res?.client_id,
      req
    );

    return PPBUF;
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

const processProductBulkUploadFile = async (
  id: number,
  path: string,
  idAppUser: number,
  clientId: number,
  req: Request
) => {
    const {ProductBulkUploadFile}= initModels(req);

  try {
    const data = await processCSVFile(path, idAppUser,clientId, req);
    if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      await ProductBulkUploadFile.update(
        {
          status: FILE_STATUS.ProcessedError,
          error: JSON.stringify({
            ...data,
            data: parseError(data.data),
          }),
          modified_date: getLocalDate(),
        },
        { where: { id } }
      );
    } else {
      await ProductBulkUploadFile.update(
        {
          status: FILE_STATUS.ProcessedSuccess,
          modified_date: getLocalDate(),
        },
        { where: { id } }
      );
    }

    return data;
  } catch (e) {
    try {
      await ProductBulkUploadFile.update(
        {
          status: FILE_STATUS.ProcessedError,
          error: JSON.stringify(parseError(e)),
          modified_date: getLocalDate(),
        },
        { where: { id } }
      );
    } catch (e) {}
  }
};

const parseError = (error: any) => {
  let errorDetail = "";
  try {
    if (error) {
      if (error instanceof Error) {
        errorDetail = error.toString();
      } else {
        errorDetail = JSON.stringify(error);
      }
    }
  } catch (e) {}
  return errorDetail;
};

const processCSVFile = async (path: string, idAppUser: number,clientId: number, req: Request) => {
  try {
    const resRows = await getArrayOfRowsFromCSVFile(path);
    if (resRows.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resRows;
    }

    const resVH = await validateHeaders(resRows.data.headers);

    if (resVH.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resVH;
    }
    const resProducts = await getProductsFromRows(resRows.data.results,clientId, req);

    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addProductToDB(resProducts.data, idAppUser,clientId, req);
    if (resAPTD.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resAPTD;
    }

    return resSuccess({ data: resAPTD });
  } catch (e) {
    throw e;
  }
};

const getArrayOfRowsFromCSVFile = async (path: string) => {
  return await new Promise<TResponseReturn>((resolve, reject) => {
    try {
      let results: any = [];
      let headerList: any = [];
      let batchSize = 0;

      readXlsxFile(path)
        .then((rows: any[]) => {
          const row = rows[0];
          const headers: string[] = [];
          row && row && row.forEach((header: any) => {
            headers.push(header);
          });
          headerList = headers;
          rows.shift();

          //Data
          rows.forEach((row: any) => {
            let data = {
              parent_sku_details: row[0],
              product_type: row[1],
              product_size: row[2],
              product_length: row[3],
              setting_type: row[4],
              dia_wt: row[5],
              dia_shape: row[6],
              dia_mm_size: row[7],
              natural_dia_clarity_color: row[8],
              lab_grown_dia_clarity_color: row[9],
              product_combination_type: row[10],
              product_total_dia_count: row[11],
              dia_count: row[12],
              alternate_dia_count: row[13],
              natural_january: row[14],
              synthetic_january: row[15],
              natural_february: row[16],
              synthetic_february: row[17],
              natural_march: row[18],
              synthetic_march: row[19],
              natural_april: row[20],
              synthetic_april: row[21],
              natural_may: row[22],
              synthetic_may: row[23],
              natural_june: row[24],
              synthetic_june: row[25],
              natural_july: row[26],
              synthetic_july: row[27],
              natural_august: row[28],
              synthetic_august: row[29],
              natural_september: row[30],
              synthetic_september: row[31],
              natural_october: row[32],
              synthetic_october: row[33],
              natural_november: row[34],
              synthetic_november: row[35],
              natural_december: row[36],
              synthetic_december: row[37],
              style_no: row[38],
              short_description: row[39],
              long_description: row[40],
              KT_9: row[41],
              KT_10: row[42],
              KT_14: row[43],
              KT_18: row[44],
              KT_22: row[45],
              silver: row[46],
              platinum: row[47],
              metal_tone: row[48],
              labour_charge: row[49],
              other_charge: row[50],
            };

            batchSize++;
            results.push(data);
          });
        })
        .then(() => {
          return resolve(
            resSuccess({ data: { results, batchSize, headers: headerList } })
          );
        });
    } catch (e) {
      return reject(e);
    }
  });
};

const validateHeaders = async (headers: string[]) => {
  const PRODUCT_BULK_UPLOAD_HEADERS = [
    "parent_sku_details",
    "product_type",
    "product_size",
    "product_length",
    "setting_type",
    "dia_wt",
    "dia_shape",
    "dia_mm_size",
    "natural_dia_clarity_color",
    "lab_grown_dia_clarity_color",
    "product_combination_type",
    "product_total_dia_count",
    "dia_count",
    "alternate_dia_count",
    "natural_january",
    "synthetic_january",
    "natural_february",
    "synthetic_february",
    "natural_march",
    "synthetic_march",
    "natural_april",
    "synthetic_april",
    "natural_may",
    "synthetic_may",
    "natural_june",
    "synthetic_june",
    "natural_july",
    "synthetic_july",
    "natural_august",
    "synthetic_august",
    "natural_september",
    "synthetic_september",
    "natural_october",
    "synthetic_october",
    "natural_november",
    "synthetic_november",
    "natural_december",
    "synthetic_december",
    "style_no",
    "short_description",
    "long_description",
    "KT_9",
    "KT_10",
    "KT_14",
    "KT_18",
    "KT_22",
    "silver",
    "platinum",
    "metal_tone",
    "labour_charge",
    "other_charge",
  ];
  let errors: {
    row_id: number;
    column_id: number;
    column_name: string;
    error_message: string;
  }[] = [];
  let i;
  for (i = 0; i < headers.length; i++) {
    if (headers[i] !== PRODUCT_BULK_UPLOAD_HEADERS[i]) {
      errors.push({
        row_id: 1,
        column_id: i,
        column_name: headers[i],
        error_message: INVALID_HEADER,
      });
    }
  }
  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};

const getProductsFromRows = async (rows: any,client_id:any, req: Request) => {
  let currentProductIndex = -1;
  let productList: any = [];
  const {StoneData,SideSettingStyles,DiamondShape,DiamondCaratSize,MMSizeData,MetalMaster,GoldKarat,SizeData,LengthData,Colors,ClarityData,CutsData,DiamondGroupMaster} = initModels(req);
  let where = { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No,company_info_id:client_id };
  try {
    let errors: {
      style_no: any;
      error_message: string;
    }[] = [];

    const settingList = await SideSettingStyles.findAll({ where });

    const gemstoneList = await StoneData.findAll({
      where,
    });
    const diamondShapeList = await DiamondShape.findAll({
      where,
    });
    const caratSizeList = await DiamondCaratSize.findAll({
      where,
    });
    const mmSizeList = await MMSizeData.findAll({
      where,
    });
    const metalMaster = await MetalMaster.findAll({
      where,
    });
    const karatMaster = await GoldKarat.findAll({
      where,
    });
    const productSize = await SizeData.findAll({
      where,
    });
    const productLength = await LengthData.findAll({
      where,
    });
    const diamondColorList = await Colors.findAll({ where });
    const diamondClarityList = await ClarityData.findAll({ where });
    const gemstoneCutList = await CutsData.findAll({ where });
    const diamondGroupMaster = await DiamondGroupMaster.findAll({
      where: { is_deleted: DeletedStatus.No,company_info_id:client_id },
    });
    for (let row of rows) {
      if (row.parent_sku_details == "1") {
        if (row.product_type == null) {
          errors.push({
            style_no: row.style_no,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "product Type"],
            ]),
          });
        }

        if (row.setting_type == null) {
          errors.push({
            style_no: row.style_no,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Setting Type"],
            ]),
          });
        }

        const setting_type = await getIdFromName(
          row.setting_type,
          settingList,
          "name",
          "Setting Type"
        );
        if (setting_type.error && setting_type.error !== null) {
          errors.push({
            style_no: row.style_no,
            error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
              ["field_name", "setting type"],
            ]),
          });
        }

        let product_size;
        let product_length;
        if (row.product_type !== "Bracelet") {
          product_size = await getIdFromName(
            row.product_size,
            productSize,
            "size",
            "Product Size"
          );
          if (product_size?.error && product_size?.error !== null) {
            errors.push({
              style_no: row.style_no,
              error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
                ["field_name", "product size"],
              ]),
            });
          }
        }

        if (row.product_type === "Bracelet") {
          product_length = await getIdFromName(
            row.product_length,
            productLength,
            "length",
            "Product length"
          );
          if (product_length.error && product_length.error !== null) {
            errors.push({
              style_no: row.style_no,
              error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
                ["field_name", "product length"],
              ]),
            });
          }
        }

        currentProductIndex++;
        productList.push({
          setting_type: setting_type.data,
          product_type: row.product_type,
          product_size: product_size ? product_size.data : null,
          product_length: product_length ? product_length.data : null,
          product_total_diamond: row.product_total_dia_count,
          product_combination_type: row.product_combination_type,
          alternate_dia_count: row.alternate_dia_count,
          style_no: row.style_no,
          dia_shape: "",
          dia_carat: "",
          dia_mm_size: "",
          dia_color: "",
          dia_clarity: "",
          dia_count: row.dia_count,
          dia_cut: "",
          dia_group: "",
          dia_type: 1,
          product_name: "",
          long_description: row.long_description,
          sort_description: row.short_description,
          labour_charge: row.labour_charge,
          other_charge: row.other_charge,
          product_metal_details: {
            product9KTList: {},
            product10KTList: {},
            product14KTList: {},
            product18KTList: {},
            product22KTList: {},
            productSilverList: {},
            productPlatinumList: {},
          },
          product_diamond_details: [],
          Product_center_diamond_details: [],
          product_metal_data: [],
        });

        if (errors && errors.length > 0) {
          return resUnknownError({ data: errors });
        }

        await addProductDetailsToProductList(
          row,
          productList,
          currentProductIndex
        );
      } else if (row.parent_sku_details == "0") {
        await addProductDetailsToProductList(
          row,
          productList,
          currentProductIndex
        );
      }
    }

    const metalProductList = await setMetalProductList(
      productList,
      metalMaster,
      karatMaster
    );

    if (metalProductList.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return metalProductList;
    }

    const centerDiamondList = await setCenterDiamondProductList(
      metalProductList.data,
      gemstoneList,
      diamondShapeList,
      caratSizeList,
      mmSizeList
    );

    if (centerDiamondList.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return centerDiamondList;
    }

    const centerDiamondColorClarity = await setCenterDiamondColorAndClaritySet(
      centerDiamondList.data,
      diamondColorList,
      diamondClarityList,
      gemstoneCutList,
      diamondGroupMaster
    );

    if (centerDiamondColorClarity.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return centerDiamondColorClarity;
    }

    const createProductVariantCombination = await createProductVariant(
      centerDiamondColorClarity.data
    );

    if (errors && errors.length > 0) {
      return resUnprocessableEntity({ data: errors });
    }

    return resSuccess({ data: createProductVariantCombination });
  } catch (e) {
    throw e;
  }
};

const getIdFromName = (
  name: string,
  list: any,
  fieldName: string,
  field_name: any
) => {
  if ((name == "" && !name) || name == null) {
    return null;
  }

  let findItem = list.find(
    (item: any) =>
      `${item.dataValues[fieldName]}`.trim().toLocaleLowerCase() ==
      name.toString().trim().toLocaleLowerCase()
  );

  return findItem
    ? { data: parseInt(findItem.dataValues.id) }
    : {
        error: prepareMessageFromParams(ERROR_NOT_FOUND, [
          ["field_name", `${name} ${field_name}`],
        ]),
      };
};

const addProductDetailsToProductList = (
  row: any,
  productList: any,
  currentProductIndex: number
) => {
  CONFIG_PRODUCT_METAL_DETAILS.forEach((detail) => {
    if (row[detail.key] && row[detail.key] !== "") {
      productList[currentProductIndex].product_metal_details[
        detail.productListField
      ] = {
        metal: detail.metal,
        karat: detail.karat,
        metal_tone: row.metal_tone,
        metal_weight: row[detail.key],
        labor_charge: row.labour_charge ? row.labour_charge : null,
      };
    }
  });

  CONFIG_PRODUCT_DIAMOND_DETAILS.forEach((detail) => {
    if (row[detail.key] && row[detail.key] !== "") {
      productList[currentProductIndex][detail.productListField].push({
        stone: detail.stone,
        diamond_type: detail.diamondType,
        dia_carat: row.dia_wt,
        dia_shape: row.dia_shape,
        dia_mm_size: row.dia_mm_size,
        dia_color_clarity: row[detail.key],
        dia_cuts: null,
        dia_count: row.dia_count,
      });
    }
  });

  CONFIG_PRODUCT_GEMSTONE_DETAILS.forEach((detail) => {
    if (row[detail.key] && row[detail.key] !== "") {
      productList[currentProductIndex][detail.productListField].push({
        stone: detail.stone,
        diamond_type: detail.diamondType,
        dia_carat: row.dia_wt,
        dia_shape: row.dia_shape,
        dia_mm_size: row.dia_mm_size,
        dia_color_clarity: null,
        dia_cuts: row[detail.key],
        dia_count: row.dia_count,
      });
    }
  });
};

const setMetalProductList = async (
  productList: any,
  metalMaster: any,
  karatMaster: any
) => {
  let errors: {
    style_no: any;
    error_message: string;
  }[] = [];
  try {
    const productData = [];

    await productList.forEach((product) => {
      const { product_metal_details } = product;
      const keysToCheck = [
        "product9KTList",
        "product10KTList",
        "product14KTList",
        "product18KTList",
        "product22KTList",
        "productSilverList",
        "productPlatinumList",
      ];
      keysToCheck.forEach(async (key) => {
        if (Object.keys(product_metal_details[key]).length > 0) {
          const metal = await getIdFromName(
            product_metal_details[key].metal,
            metalMaster,
            "name",
            "Metal"
          );
          if (metal.error && metal.error !== null) {
            errors.push({
              style_no: product.style_no,
              error_message: metal.error,
            });
          }
          if (product_metal_details[key].karat) {
            const karat = await getIdFromName(
              product_metal_details[key].karat,
              karatMaster,
              "name",
              "Karat"
            );
            if (karat.error && karat.error !== null) {
              errors.push({
                style_no: product.style_no,
                error_message: karat.error,
              });
            }
            product_metal_details[key].id_karat = karat.data;
          } else {
            product_metal_details[key].id_karat = null;
          }

          product_metal_details[key].id_metal = metal.data;
          productData.push({
            ...product,
            product_metal_data: product_metal_details[key],
            product_metal_details: {},
          });
        }
      });
    }, []);

    if (errors && errors.length > 1) {
      return resUnknownError({ data: errors });
    }
    return resSuccess({ data: productData });
  } catch (error) {
    throw error;
  }
};

const setCenterDiamondProductList = async (
  productList: any,
  gemstoneList: any,
  diamondShapeList: any,
  caratSizeList: any,
  mmSizeList: any
) => {
  let errors: {
    style_no: any;
    error_message: string;
  }[] = [];

  for (let index = 0; index < productList.length; index++) {
    const productDetail = (detail: any) => {
      const data = [];
      for (let j = 0; j < detail.length; j++) {
        const element = detail[j];
        const stone = getIdFromName(
          element.stone,
          gemstoneList,
          "sort_code",
          "Sort Code"
        );
        if (stone.error && stone.error !== null) {
          errors.push({
            style_no: productList[index].style_no,
            error_message: stone.error,
          });
        }

        const diaShape = getIdFromName(
          element.dia_shape,
          diamondShapeList,
          "name",
          "shape"
        );
        if (diaShape.error && diaShape.error !== null) {
          errors.push({
            style_no: productList[index].style_no,
            error_message: diaShape.error,
          });
        }

        const diaCarat = getIdFromName(
          element.dia_carat,
          caratSizeList,
          "value",
          "carat"
        );
        if (diaCarat.error && diaCarat.error !== null) {
          errors.push({
            style_no: productList[index].style_no,
            error_message: diaCarat.error,
          });
        }

        const diaMmSize = getIdFromName(
          element.dia_mm_size,
          mmSizeList,
          "value",
          "mm size"
        );
        // if (diaMmSize.error && diaMmSize.error !== null) {
        //   errors.push({
        //     style_no: productList[index].style_no,
        //     error_message: diaMmSize.error,
        //   });
        // }

        if (errors.length === 0) {
          data.push({
            ...element,
            stone: stone.data,
            stone_name: element.stone,
            dia_shape: diaShape.data,
            dia_carat: diaCarat.data,
            dia_mm_size:
              diaMmSize &&
              diaMmSize != undefined &&
              diaMmSize != null &&
              diaMmSize.data != 0
                ? diaMmSize?.data
                : null,
            dia_color:
              element.dia_color_clarity &&
              element.dia_color_clarity
                .split(",")
                .map((value: any) => value.split("|")[0]),
            dia_clarity:
              element.dia_color_clarity &&
              element.dia_color_clarity
                .split(",")
                .map((value: any) => value.split("|")[1]),
            dia_cuts: element.dia_cuts && element.dia_cuts.split("|"),
          });
        }
      }
      return data;
    };

    productList[index].Product_center_diamond_details = productDetail(
      productList[index].Product_center_diamond_details
    );
    productList[index].product_diamond_details = productDetail(
      productList[index].product_diamond_details
    );
  }

  if (errors && errors.length > 1) {
    return resUnknownError({ data: errors });
  }
  return resSuccess({ data: productList });
};

const setCenterDiamondColorAndClaritySet = async (
  productList: any,
  diamondColorList: any,
  diamondClarityList: any,
  gemstoneCutList: any,
  diamondGroupMaster: any
) => {
  try {
    let errors: {
      style_no: any;
      error_message: string;
    }[] = [];
    for (let index = 0; index < productList.length; index++) {
      const productColorClarityArray = [];
      const productCutArray = [];
      for (
        let j = 0;
        j < productList[index].Product_center_diamond_details.length;
        j++
      ) {
        if (
          productList[index].Product_center_diamond_details[j].dia_color &&
          productList[index].Product_center_diamond_details[j].dia_color
            .length > 0
        ) {
          for (
            let k = 0;
            k <
            productList[index].Product_center_diamond_details[j].dia_color
              .length;
            k++
          ) {
            const color =
              productList[index].Product_center_diamond_details[j].dia_color[k];
            const clarity =
              productList[index].Product_center_diamond_details[j].dia_clarity[
                k
              ];

            const colorData = await getIdFromName(
              color,
              diamondColorList,
              "name",
              "Color"
            );
            if (colorData.error && colorData.error !== null) {
              errors.push({
                style_no: productList[index].style_no,
                error_message: colorData.error,
              });
            }

            const clarityData = await getIdFromName(
              clarity,
              diamondClarityList,
              "name",
              "clarity"
            );
            if (clarityData.error && clarityData.error !== null) {
              errors.push({
                style_no: productList[index].style_no,
                error_message: clarityData.error,
              });
            }

            const diamondGroup = diamondGroupMaster.find(
              (t) =>
                t.dataValues.id_stone ==
                  productList[index].Product_center_diamond_details[j].stone &&
                t.dataValues.id_shape ==
                  productList[index].Product_center_diamond_details[j]
                    .dia_shape &&
                t.dataValues.id_color == colorData.data &&
                t.dataValues.id_clarity == clarityData.data &&
                t.dataValues.id_carat ==
                  productList[index].Product_center_diamond_details[j]
                    .dia_carat &&
                t.dataValues.id_cuts ==
                  productList[index].Product_center_diamond_details[j].dia_cuts
            );

            if (!(diamondGroup && diamondGroup.dataValues)) {
              errors.push({
                style_no: productList[index].style_no,
                error_message: "Diamond group not found",
              });
            }

            if (errors.length === 0) {
              productColorClarityArray.push({
                ...productList[index].Product_center_diamond_details[j],
                dia_color: colorData.data,
                dia_clarity: clarityData.data,
                dia_group: diamondGroup.dataValues.id,
              });
            }
          }
        }
      }
      for (
        let j = 0;
        j < productList[index].product_diamond_details.length;
        j++
      ) {
        if (
          productList[index].product_diamond_details[j].dia_cuts &&
          productList[index].product_diamond_details[j].dia_cuts.length > 0
        ) {
          for (
            let k = 0;
            k < productList[index].product_diamond_details[j].dia_cuts.length;
            k++
          ) {
            const cuts =
              productList[index].product_diamond_details[j].dia_cuts[k];

            const cutData = await getIdFromName(
              cuts,
              gemstoneCutList,
              "value",
              "Cut"
            );
            if (cutData.error && cutData.error !== null) {
              errors.push({
                style_no: productList[index].style_no,
                error_message: cutData.error,
              });
            }

            const diamondGroup = diamondGroupMaster.find(
              (t) =>
                t.dataValues.id_stone ==
                  productList[index].product_diamond_details[j].stone &&
                t.dataValues.id_shape ==
                  productList[index].product_diamond_details[j].dia_shape &&
                t.dataValues.id_color ==
                  productList[index].product_diamond_details[j].dia_color &&
                t.dataValues.id_clarity ==
                  productList[index].product_diamond_details[j].dia_clarity &&
                t.dataValues.id_carat ==
                  productList[index].product_diamond_details[j].dia_carat &&
                t.dataValues.id_cuts == cutData.data
            );

            if (!(diamondGroup && diamondGroup.dataValues)) {
              errors.push({
                style_no: productList[index].style_no,
                error_message: "Diamond group not found",
              });
            }

            if (errors.length === 0) {
              productCutArray.push({
                ...productList[index].product_diamond_details[j],
                dia_cuts: cutData.data,
                dia_group: diamondGroup.dataValues.id,
              });
            }
          }
        }
      }
      productList[index].Product_center_diamond_details =
        productColorClarityArray;
      productList[index].product_diamond_details = productCutArray;
    }

    if (errors && errors.length > 1) {
      return await resUnknownError({ data: errors });
    }
    return resSuccess({ data: productList });
  } catch (error) {
    throw error;
  }
};

const createProductVariant = (productList: any) => {
  try {
    const productData = [];

    for (let index = 0; index < productList.length; index++) {
      if (
        productList[index].Product_center_diamond_details &&
        productList[index].Product_center_diamond_details.length > 0
      ) {
        for (
          let t = 0;
          t < productList[index].Product_center_diamond_details.length;
          t++
        ) {
          productData.push({
            ...productList[index],
            dia_color:
              productList[index].Product_center_diamond_details[t].dia_color,
            dia_clarity:
              productList[index].Product_center_diamond_details[t].dia_clarity,
            dia_group:
              productList[index].Product_center_diamond_details[t].dia_group,
            dia_shape:
              productList[index].Product_center_diamond_details[t].dia_shape,
            dia_mm_size:
              productList[index].Product_center_diamond_details[t].dia_mm_size,
            dia_carat:
              productList[index].Product_center_diamond_details[t].dia_carat,
            diamond_type:
              productList[index].Product_center_diamond_details[t].diamond_type,
            stone: productList[index].Product_center_diamond_details[t].stone,
            product_combination_type: EternityProductCombinationType.Diamond,
            Product_center_diamond_details: [],
            product_diamond_details: {},
          });
        }
      }
      for (
        let t = 0;
        t < productList[index].product_diamond_details.length;
        t++
      ) {
        productData.push({
          ...productList[index],
          dia_color: productList[index].product_diamond_details[t].dia_color,
          dia_clarity:
            productList[index].product_diamond_details[t].dia_clarity,
          dia_group: productList[index].product_diamond_details[t].dia_group,
          dia_shape: productList[index].product_diamond_details[t].dia_shape,
          dia_mm_size:
            productList[index].product_diamond_details[t].dia_mm_size,
          dia_carat: productList[index].product_diamond_details[t].dia_carat,
          diamond_type:
            productList[index].product_diamond_details[t].diamond_type,
          stone: productList[index].product_diamond_details[t].stone,
          product_combination_type: EternityProductCombinationType.Gemstone,
          product_diamond_details: {},
          Product_center_diamond_details: [],
          dia_cut: productList[index].product_diamond_details[t].dia_cuts,
        });
      }

      if (productList[index].alternate_dia_count) {
        if (
          productList[index].product_diamond_details &&
          productList[index].product_diamond_details.length > 0
        ) {
          for (
            let j = 0;
            j < productList[index].product_diamond_details.length;
            j++
          ) {
            for (
              let t = 0;
              t < productList[index].Product_center_diamond_details.length;
              t++
            ) {
              const centerDiamondDetail =
                productList[index].Product_center_diamond_details[t];
              const diamondDetail =
                productList[index].product_diamond_details[j];

              if (
                diamondDetail.diamond_type === centerDiamondDetail.diamond_type
              ) {
                productData.push({
                  ...productList[index],
                  dia_color: centerDiamondDetail.dia_color,
                  dia_clarity: centerDiamondDetail.dia_clarity,
                  dia_group: centerDiamondDetail.dia_group,
                  dia_shape: centerDiamondDetail.dia_shape,
                  dia_mm_size: centerDiamondDetail.dia_mm_size,
                  dia_carat: centerDiamondDetail.dia_carat,
                  diamond_type: centerDiamondDetail.diamond_type,
                  stone: centerDiamondDetail.stone,
                  product_combination_type:
                    EternityProductCombinationType.DiamondGemstone,
                  product_diamond_details: diamondDetail,
                  Product_center_diamond_details: [],
                });
              }
            }
          }
        }
        if (
          productList[index].product_combination_type ===
          EternityProductCombinationType.GemstoneGemstone
        ) {
          function createFilteredCombinations(diamondDetails) {
            let seenCombinations = {};
            for (let t = 0; t < diamondDetails.length; t++) {
              for (let i = t + 1; i < diamondDetails.length; i++) {
                if (
                  diamondDetails[i].stone !== diamondDetails[t].stone &&
                  diamondDetails[i].diamond_type ===
                    diamondDetails[t].diamond_type
                ) {
                  let combinationKey = [
                    diamondDetails[t].stone_name,
                    diamondDetails[t].dia_cuts,
                    diamondDetails[i].stone_name,
                    diamondDetails[i].dia_cuts,
                    diamondDetails[i].diamond_type === 1 ? "N" : "S",
                  ]
                    .sort()
                    .join("-");

                  if (!seenCombinations[combinationKey]) {
                    seenCombinations[combinationKey] = true;
                    productData.push({
                      ...productList[index],
                      product_diamond_details: diamondDetails[i],
                      Product_center_diamond_details: [],
                      dia_cut:
                        productList[index].product_diamond_details[t].dia_cuts,
                      dia_color:
                        productList[index].product_diamond_details[t].dia_color,
                      dia_clarity:
                        productList[index].product_diamond_details[t]
                          .dia_clarity,
                      dia_group:
                        productList[index].product_diamond_details[t].dia_group,
                      dia_shape:
                        productList[index].product_diamond_details[t].dia_shape,
                      dia_mm_size:
                        productList[index].product_diamond_details[t]
                          .dia_mm_size,
                      dia_carat:
                        productList[index].product_diamond_details[t].dia_carat,
                      diamond_type:
                        productList[index].product_diamond_details[t]
                          .diamond_type,
                      product_combination_type:
                        EternityProductCombinationType.GemstoneGemstone,
                      stone:
                        productList[index].product_diamond_details[t].stone,
                    });
                  }
                }
              }
            }
          }
          createFilteredCombinations(
            productList[index].product_diamond_details
          );
        }
      }
    }

    return productData;
  } catch (error) {
    throw error;
  }
};

const addProductToDB = async (productList: any, idAppUser: number,client_id:number, req: Request) => {
  const trn = await req.body.db_connection.transaction();
  const {SideSettingStyles, StoneData, DiamondShape,MetalMaster,GoldKarat,SizeData,ConfigEternityProductMetalDetail,ConfigEternityProductDiamondDetails, DiamondCaratSize, Colors, ClarityData, CutsData, LengthData, ConfigEternityProduct} = initModels(req);
  let activitylogs: any = {}
  let resProduct,
    prodMetalPayload: any = [],
    productDiamondPayload: any = [];
  const where = {
    is_active: ActiveStatus.Active,
    is_deleted: DeletedStatus.No,
    company_info_id:client_id,
  };

  try {
    const sideSetting = await SideSettingStyles.findAll({
      where,
    });
    const stone = await StoneData.findAll({
      where,
    });
    const shape = await DiamondShape.findAll({
      where,
    });
    const metalMaster = await MetalMaster.findAll({
      where,
    });
    const karatMaster = await GoldKarat.findAll({
      where,
    });
    const caratMaster = await DiamondCaratSize.findAll({
      where,
    });
    const colorMaster = await Colors.findAll({
      where,
    });
    const clarityMaster = await ClarityData.findAll({
      where,
    });
    const cutMaster = await CutsData.findAll({
      where,
    });
    const stoneMaster = await StoneData.findAll({
      where,
    });
    const productSizeMaster = await SizeData.findAll({
      where,
    });
    const productLengthMaster = await LengthData.findAll({
      where,
    });

    for (const product of productList) {
      const setting = await getPipedShortCodeFromField(
        sideSetting,
        product.setting_type,
        "id",
        "sort_code"
      );
      const centerStone = await getPipedShortCodeFromField(
        stone,
        product.stone,
        "id",
        "sort_code"
      );
      const centerStoneName = await getPipedShortCodeFromField(
        stone,
        product.stone,
        "id",
        "name"
      );
      const diamondShape = await getPipedShortCodeFromField(
        shape,
        product.dia_shape,
        "id",
        "sort_code"
      );
      const metal = await getPipedShortCodeFromField(
        metalMaster,
        product.product_metal_data.id_metal,
        "id",
        "name"
      );
      const karat = await getPipedShortCodeFromField(
        karatMaster,
        product.product_metal_data.id_karat,
        "id",
        "name"
      );
      const carat = await getPipedShortCodeFromField(
        caratMaster,
        product.dia_carat,
        "id",
        "value"
      );
      const caratSortCode = await getPipedShortCodeFromField(
        caratMaster,
        product.dia_carat,
        "id",
        "sort_code"
      );
      const diamondShapeName = await getPipedShortCodeFromField(
        shape,
        product.dia_shape,
        "id",
        "name"
      );
      const settingName = await getPipedShortCodeFromField(
        sideSetting,
        product.setting_type,
        "id",
        "name"
      );
      const color = await getPipedShortCodeFromField(
        colorMaster,
        product.dia_color,
        "id",
        "name"
      );
      const clarity = await getPipedShortCodeFromField(
        clarityMaster,
        product.dia_clarity,
        "id",
        "name"
      );
      const cut = await getPipedShortCodeFromField(
        cutMaster,
        product.dia_cut,
        "id",
        "slug"
      );
      const productSize = await getPipedShortCodeFromField(
        productSizeMaster,
        product.product_size,
        "id",
        "size"
      );
      const productLength = await getPipedShortCodeFromField(
        productLengthMaster,
        product.product_length,
        "id",
        "length"
      );
      const sideShape = await getPipedShortCodeFromField(
        shape,
        product.product_diamond_details.dia_shape,
        "id",
        "name"
      );
      const sideStone = await getPipedShortCodeFromField(
        stoneMaster,
        product.product_diamond_details.stone,
        "id",
        "sort_code"
      );
      const sideCut = await getPipedShortCodeFromField(
        cutMaster,
        product.product_diamond_details.dia_cuts,
        "id",
        "slug"
      );

      const sku = karat
        ? `${
            DIAMOND_TYPE.natural === product.diamond_type
              ? "NATURAL"
              : "LAB_GROWN"
          }-${setting}-${centerStone}-${caratSortCode}-${diamondShape}${
            color && clarity ? `-${color}-${clarity}` : `-${cut}`
          }-${metal}${
            Object.keys(product.product_diamond_details).length > 0
              ? `-${sideShape}-${sideStone}-${sideCut}`
              : ""
          }-${productSize ?? productLength}-${karat}KT`
        : `${
            DIAMOND_TYPE.natural === product.diamond_type
              ? "NATURAL"
              : "LAB_GROWN"
          }-${setting}-${centerStone}-${caratSortCode}-${diamondShape}${
            color && clarity ? `-${color}-${clarity}` : `-${cut}`
          }-${metal}${
            Object.keys(product.product_diamond_details).length > 0
              ? `-${sideShape}-${sideStone}-${sideCut}`
              : ""
          }-${productSize ?? productLength}`;
      const product_name: any = karat
        ? `${karat}ct ${
            DIAMOND_TYPE.natural === product.diamond_type
              ? "NATURAL"
              : "LAB_GROWN"
          } ${centerStoneName} ${diamondShapeName} ${carat}Carat ${
            color && clarity
              ? ` ${color} color ${clarity} clarity`
              : ` ${cut} cut`
          } ${settingName} ${productSize ?? productLength} product size Band`
        : `${metal} ${
            DIAMOND_TYPE.natural === product.diamond_type
              ? "NATURAL"
              : "LAB_GROWN"
          } ${centerStoneName} ${diamondShapeName} ${carat}Carat ${
            color && clarity
              ? ` ${color} color ${clarity} clarity`
              : ` ${cut} cut`
          } ${settingName} ${productSize ?? productLength} product size Band`;

      let slug = product_name
        .toLocaleLowerCase()
        .toString()
        .replaceAll(" ", "-")
        .replaceAll(/['/|]/g, "-");

      const sameSlugCount = await ConfigEternityProduct.count({
        where: [
          columnValueLowerCase("slug", slug),
          { is_deleted: DeletedStatus.No },
        ],
        transaction: trn,
      });

      if (sameSlugCount > 0) {
        slug = `${slug}-${sameSlugCount}`;
      }
      resProduct = await ConfigEternityProduct.create(
        {
          id_stone: product.stone,
          side_setting_id: product.setting_type,
          style_no: product.style_no,
          product_title: product_name,
          product_sort_des: product.sort_description
            ? product.sort_description
            : product_name,
          product_long_des: product.long_description
            ? product.long_description
            : product_name,
          sku: sku,
          dia_cts: product.dia_carat ? product.dia_carat : null,
          dia_shape_id: product.dia_shape ? product.dia_shape : null,
          dia_clarity_id: product.dia_clarity ? product.dia_clarity : null,
          dia_cut_id: product.dia_cut ? product.dia_cut : null,
          dia_mm_id: product.dia_mm_size ? product.dia_mm_size : null,
          dia_color: product.dia_color ? product.dia_color : null,
          dia_count: product.dia_count ? product.dia_count : null,
          diamond_group_id: product.dia_group,
          prod_dia_total_count: product.product_total_diamond
            ? product.product_total_diamond
            : null,
          alternate_dia_count: product.alternate_dia_count
            ? product.alternate_dia_count
            : null,
          product_type: product.product_type,
          product_size: product.product_size,
          product_length: product.product_length,
          product_combo_type: product.product_combination_type,
          slug: slug,
          created_by: idAppUser,
          labour_charge: product.labour_charge
            ? parseFloat(product.labour_charge)
            : 0,
          other_changes: product.other_charge
            ? parseFloat(product.other_charge)
            : 0,
          is_deleted: DeletedStatus.No,
          dia_type: product.diamond_type,
          created_date: getLocalDate(),
          company_info_id:client_id
        },
        { transaction: trn }
      );

      activitylogs = { ...resProduct?.dataValues}

      prodMetalPayload.push({
        config_eternity_id: resProduct.dataValues.id,
        metal_id: product.product_metal_data.id_metal,
        karat_id: product.product_metal_data.id_karat,
        metal_tone: product.product_metal_data.metal_tone,
        metal_wt: product.product_metal_data.metal_weight,
        labor_charge: product.labour_charge
          ? parseFloat(product.labour_charge)
          : 0,
        created_date: getLocalDate(),
        created_by: idAppUser,
        company_info_id:client_id,
      });

      productDiamondPayload.push({
        config_eternity_product_id: resProduct.dataValues.id,
        dia_count: product.product_diamond_details.dia_count,
        dia_cts: product.product_diamond_details.dia_carat,
        diamond_type: product.product_diamond_details.diamond_type,
        dia_stone: product.product_diamond_details.stone,
        created_by: idAppUser,
        created_date: getLocalDate(),
        id_diamond_group: product.product_diamond_details.dia_group,
        dia_weight: product.product_diamond_details.dia_carat,
        dia_shape: product.product_diamond_details.dia_shape,
        dia_color: product.product_diamond_details.dia_color,
        dia_mm_size: product.product_diamond_details.dia_mm_size,
        dia_clarity: product.product_diamond_details.dia_clarity,
        dia_cuts: product.product_diamond_details.dia_cuts,
        company_info_id:client_id,
      });
    }

    const ConfigProductDiamondsData = await ConfigEternityProductDiamondDetails.bulkCreate(
      productDiamondPayload,
      {
        transaction: trn,
      }
    );
    const ConfigProductMetalsData =await ConfigEternityProductMetalDetail.bulkCreate(prodMetalPayload, {
      transaction: trn,
    });
 activitylogs = {...activitylogs,Metal:ConfigProductMetalsData.map((t)=>t.dataValues),diamonds:ConfigProductDiamondsData.map((t)=>t.dataValues)}
    await addActivityLogs(req,client_id,[{
      old_data: null,
      new_data: activitylogs}], resProduct?.dataValues?.id, LogsActivityType.Add, LogsType.ConfigEternityProductBulkUpload, idAppUser,trn)
   
    await trn.commit();
    await refreshMaterializedEternityBandSideBarDataView(req);
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    return resUnknownError({ data: e });
  }
};

const getPipedShortCodeFromField = async (
  model: any,
  fieldValue: string,
  fieldName: string,
  returnValue: string,
) => {
  if (fieldValue == null || fieldValue === "") {
    return null;
  }
  let findData = await model.find(
    (t) => t.dataValues[fieldName] === fieldValue
  );

  return findData ? findData[returnValue] : null;
};

export const getEternityProductList = async (req: Request) => {
  try {
    const { ConfigEternityProduct, ConfigEternityProductMetalDetail, ConfigEternityProductDiamondDetails, DiamondGroupMaster, StoneData, DiamondCaratSize,
      Colors, ClarityData, CutsData, DiamondShape,SideSettingStyles } = initModels(req);
    let paginationProps = {};
    const { product_type = "Eternity Band" } = req.query;

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
      { product_type: product_type },
      pagination.is_active ? { is_active: pagination.is_active } : {},
      pagination.search_text
        ? {
            [Op.or]: [
              {
                product_title: {
                  [Op.iLike]: "%" + pagination.search_text + "%",
                },
              },
              { slug: { [Op.iLike]: "%" + pagination.search_text + "%" } },
              { sku: { [Op.iLike]: "%" + pagination.search_text + "%" } },
            ],
          }
        : {},
    ];

    if (!noPagination) {
      const totalItems = await ConfigEternityProduct.count({
        where,
      });

      if (totalItems === 0) {
        return resSuccess({ data: { pagination, result: [] } });
      }
      pagination.total_items = totalItems;
      pagination.total_pages = Math.ceil(totalItems / pagination.per_page_rows);

      paginationProps = {
        limit: pagination.per_page_rows,
        offset: (pagination.current_page - 1) * pagination.per_page_rows,
      };
    }

    const result = await ConfigEternityProduct.findAll({
      ...paginationProps,
      where,
      order: [
        pagination.sort_by === "diamond_shape_name"
          ? ["diamond_shape", "name", pagination.order_by]
          : pagination.sort_by === "diamond_cut_value"
          ? ["diamond_cut", "value", pagination.order_by]
          : pagination.sort_by === "diamond_clarity_value"
          ? ["diamond_clarity", "value", pagination.order_by]
          : pagination.sort_by === "diamond_color_name"
          ? ["diamond_color", "name", pagination.order_by]
          : [pagination.sort_by, pagination.order_by],
      ],
      attributes: [
        "id",
        "product_title",
        "sku",
        "dia_cts",
        "style_no",
        "product_size",
        "product_length",
        "slug",
        [Sequelize.literal("side_setting.name"), "side_setting_name"],
        [Sequelize.literal("diamond_shape.name"), "diamond_shape_name"],
        [Sequelize.literal("diamond_cut.value"), "diamond_cut_value"],
        [Sequelize.literal("diamond_clarity.value"), "diamond_clarity_value"],
        [Sequelize.literal("diamond_color.name"), "diamond_color_name"],
        [
          Sequelize.literal(`"DiamondGroupMaster->stones"."name"`),
          "stone_name",
        ],
        [
          Sequelize.literal(`"DiamondGroupMaster->carats"."value"`),
          "diamond_carat_size",
        ],
      ],
      include: [
        {
          required: false,
          model: SideSettingStyles,
          as: "side_setting",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
        },
        {
          required: false,
          model: DiamondShape,
          as: "diamond_shape",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
        },
        {
          required: false,
          model: CutsData,
          as: "diamond_cut",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
        },
        {
          required: false,
          model: Colors,
          as: "diamond_color",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
        },
        {
          required: false,
          model: ClarityData,
          as: "diamond_clarity",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
        },
        {
          required: false,
          model: DiamondGroupMaster,
          as: "DiamondGroupMaster",
          attributes: [],
          where: { company_info_id: req?.body?.session_res?.client_id },
          include: [
            {
              required: false,
              model: StoneData,
              as: "stones",
              attributes: [],
              where: { company_info_id: req?.body?.session_res?.client_id },
            },
            {
              required: false,
              model: DiamondCaratSize,
              as: "carats",
              attributes: [],
              where: { company_info_id: req?.body?.session_res?.client_id },
            },
          ],
        }
      ],
    });

    return resSuccess({ data: { pagination, productList: result } });
  } catch (error) {
    throw error;
  }
};

export const getEternityProduct = async (req: Request) => {
  try {
    const {ConfigEternityProductMetalDetail, ConfigEternityProductDiamondDetails,GoldKarat,MetalMaster,ConfigEternityProduct,SideSettingStyles,DiamondShape,CutsData,Colors,ClarityData,DiamondGroupMaster, DiamondCaratSize,StoneData} = initModels(req);
    const product = await ConfigEternityProduct.findOne({
      where: {
        id: req.params.product_id,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
      attributes: [
        "id",
        "side_setting_id",
        "product_title",
        "product_sort_des",
        "product_long_des",
        "sku",
        "dia_cts",
        "dia_shape_id",
        "dia_clarity_id",
        "dia_cut_id",
        "style_no",
        "dia_mm_id",
        "dia_color",
        "labour_charge",
        "diamond_group_id",
        "product_size",
        "product_length",
        "product_combo_type",
        "slug",
        "discount_type",
        "discount_value",
        "dia_type",
        "id_stone",
        "labour_charge",
        "other_charge",
        "prod_dia_total_count",
        "alternate_dia_count",
        "dia_count",
        [Sequelize.literal("side_setting.name"), "side_setting_name"],
        [Sequelize.literal("diamond_shape.name"), "diamond_shape_name"],
        [Sequelize.literal("diamond_cut.value"), "diamond_cut_value"],
        [Sequelize.literal("diamond_clarity.value"), "diamond_clarity_value"],
        [Sequelize.literal("diamond_color.name"), "diamond_color_name"],
        [
          Sequelize.literal(`"DiamondGroupMaster->stones"."name"`),
          "stone_name",
        ],
        [
          Sequelize.literal(`"DiamondGroupMaster->stones"."sort_code"`),
          "stone_sort_code",
        ],
        [
          Sequelize.literal(`"DiamondGroupMaster->carats"."value"`),
          "diamond_carat_size",
        ],
        [
          Sequelize.literal(
            `CASE WHEN "DiamondGroupMaster"."rate" IS NULL THEN  "DiamondGroupMaster"."synthetic_rate" ELSE "DiamondGroupMaster"."rate" END`
          ),
          "diamond_price",
        ],
      ],
      include: [
        {
          required: false,
          model: SideSettingStyles,
          as: "side_setting",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
        },
        {
          required: false,
          model: DiamondShape,
          as: "diamond_shape",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
        },
        {
          required: false,
          model: CutsData,
          as: "diamond_cut",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
        },
        {
          required: false,
          model: Colors,
          as: "diamond_color",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
        },
        {
          required: false,
          model: ClarityData,
          as: "diamond_clarity",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
        },
        {
          required: false,
          model: DiamondGroupMaster,
          as: "DiamondGroupMaster",
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
          include: [
            {
              required: false,
              model: StoneData,
              as: "stones",
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
            },
            {
              required: false,
              model: DiamondCaratSize,
              as: "carats",
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
            },
          ],
        },
        {
          required: false,
          model: ConfigEternityProductDiamondDetails,
          where:{company_info_id :req?.body?.session_res?.client_id},
          attributes: [
            "id",
            "config_eternity_product_id",
            "dia_count",
            "dia_cts",
            "diamond_type",
            "id_diamond_group",
            "dia_weight",
            "dia_shape",
            "dia_stone",
            "dia_color",
            "dia_mm_size",
            "dia_clarity",
            "dia_cuts",
            [
              Sequelize.literal(`"diamonds->shape"."name"`),
              "diamond_shape_name",
            ],
            [
              Sequelize.literal(`"diamonds->cuts"."value"`),
              "diamond_cut_value",
            ],
            [
              Sequelize.literal(`"diamonds->clarity"."value"`),
              "diamond_clarity_value",
            ],
            [
              Sequelize.literal(`"diamonds->color"."name"`),
              "diamond_color_name",
            ],
            [Sequelize.literal(`"diamonds->stone"."name"`), "stone_name"],
            [
              Sequelize.literal(`"diamonds->stone"."sort_code"`),
              "stone_sort_code",
            ],
            [
              Sequelize.literal(`"diamonds->carat"."value"`),
              "diamond_carat_size",
            ],
            [
              Sequelize.literal(
                `CASE WHEN "diamonds->DiamondGroup"."rate" IS NULL THEN  "diamonds->DiamondGroup"."synthetic_rate" ELSE "diamonds->DiamondGroup"."rate" END`
              ),
              "diamond_price",
            ],
          ],
          as: "diamonds",
          include: [
            {
              model: DiamondShape,
              as: "shape",
              attributes: [],
              required: false,
              where:{company_info_id :req?.body?.session_res?.client_id}
            },
            {
              model: Colors,
              as: "color",
              attributes: [],
              required: false,
              where:{company_info_id :req?.body?.session_res?.client_id}
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
              required: false,
              where:{company_info_id :req?.body?.session_res?.client_id}
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
              required: false,
              where:{company_info_id :req?.body?.session_res?.client_id}
            },
            {
              model: StoneData,
              as: "stone",
              attributes: [],
              required: false,
              where:{company_info_id :req?.body?.session_res?.client_id}
            },
            {
              model: DiamondCaratSize,
              as: "carat",
              attributes: [],
              required: false,
              where:{company_info_id :req?.body?.session_res?.client_id}
            },
            {
              model: DiamondGroupMaster,
              as: "DiamondGroup",
              attributes: [],
              required: false,
              where:{company_info_id :req?.body?.session_res?.client_id}
            },
          ],
        },
        {
          required: false,
          model: ConfigEternityProductMetalDetail,
          where:{company_info_id :req?.body?.session_res?.client_id},
          attributes: [
            "id",
            "config_eternity_id",
            "metal_id",
            "metal_wt",
            "karat_id",
            "metal_tone",
            "labour_charge",
            [Sequelize.literal(`"metal->KaratMaster"."name"`), "karat_name"],
            [Sequelize.literal(`"metal->MetalMaster"."name"`), "metal_name"],
            [
              Sequelize.literal(
                `CASE WHEN karat_id IS NULL THEN (metal_wt*"metal->MetalMaster"."metal_rate") ELSE metal_wt*("metal->MetalMaster"."metal_rate"/"metal->MetalMaster"."calculate_rate"*"metal->KaratMaster"."calculate_rate") END`
              ),
              "metal_price",
            ],
          ],
          as: "metal",
          include: [
            {
              model: GoldKarat,
              as: "KaratMaster",
              attributes: [],
              required: false,
              where:{company_info_id :req?.body?.session_res?.client_id}
            },
            {
              model: MetalMaster,
              as: "MetalMaster",
              attributes: [],
              required: false,
              where:{company_info_id :req?.body?.session_res?.client_id}
            },
          ],
        },
      ],
    });

    if (!(product && product.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(DATA_NOT_FOUND, [
          ["field_name", "Product"],
        ]),
      });
    }

    return resSuccess({ data: product });
  } catch (error) {
    throw error;
  }
};

export const deleteEternityProduct = async (req: Request) => {
  try {
    const {ConfigEternityProduct,ConfigEternityProductDiamondDetails,ConfigEternityProductMetalDetail,ProductWish,CartProducts} = initModels(req);
    const product = await ConfigEternityProduct.findOne({
      where: {
        id: req.params.product_id,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
      include: [
        {
          model: ConfigEternityProductDiamondDetails,
          attributes: [],
          required: false,
          where:{company_info_id :req?.body?.session_res?.client_id},
          as: "diamonds",
        },
        {
          model: ConfigEternityProductMetalDetail,
          attributes: [],
          required: false,
          where:{company_info_id :req?.body?.session_res?.client_id},
          as: "metal",
        },
      ],
    });

    if (!(product && product.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(DATA_NOT_FOUND, [
          ["field_name", "Product"],
        ]),
      });
    }
    const trn = await req.body.db_connection.transaction();
    try {
      await ConfigEternityProduct.update(
        { is_deleted: DeletedStatus.yes },
        { where: { id: req.params.product_id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
      );

      await ConfigEternityProductDiamondDetails.update(
        { is_deleted: DeletedStatus.yes },
        {
          where: { config_eternity_product_id: req.params.product_id,company_info_id :req?.body?.session_res?.client_id  },
          transaction: trn,
        }
      );

      await ConfigEternityProductMetalDetail.update(
        { is_deleted: DeletedStatus.yes },
        {
          where: { config_eternity_id: req.params.product_id,company_info_id :req?.body?.session_res?.client_id  },
          transaction: trn,
        }
      );
      const findProductWish = await ProductWish.findAll({
        where: {
          product_id: req.params.product_id,
          product_type: [AllProductTypes.Eternity_product],
        },
        transaction: trn,
      });
      await ProductWish.destroy({
        where: {
          product_id: req.params.product_id,
          product_type: [AllProductTypes.Eternity_product],
          company_info_id :req?.body?.session_res?.client_id 
        },
        transaction: trn,
      });
      const findCartProducts = await CartProducts.findAll({
        where: {
          product_id: req.params.product_id,
          product_type: [AllProductTypes.Eternity_product],
        },
        transaction: trn,
      });  
      await CartProducts.destroy({
        where: {
          product_id: req.params.product_id,
          product_type: [AllProductTypes.Eternity_product],
          company_info_id :req?.body?.session_res?.client_id 
        },
        transaction: trn,
      });

      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { config_eternity_product_id: product?.dataValues?.id, data: {...product?.dataValues},findProductWishdata: findProductWish.map((t: any) => t.dataValues),
        findCartProducts: findCartProducts.map((t: any) => t.dataValues)},
        new_data: {
          config_eternity_product_id: product?.dataValues?.id, data: {
            ...product?.dataValues, is_deleted: DeletedStatus.yes,
            modified_by: req?.body?.session_res?.id_app_user,
            modified_date: getLocalDate(),
          },findProductWishdata: null,
          findCartProducts: null
        }
      }], product?.dataValues?.id, LogsActivityType.Delete, LogsType.ConfigEternityProductBulkUpload, req?.body?.session_res?.id_app_user,trn)
      await trn.commit();
      await refreshMaterializedEternityBandConfiguratorPriceFindView;
      return resSuccess();
    } catch (error) {
      await trn.rollback();
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

export const eternityPriceFind = async (req: any) => {
  try {
    const {
      diamond_type,
      shape,
      stone,
      caratSize,
      color,
      clarity,
      cut,
      metal,
      karat,
      ringSize,
      length,
      gemstone,
      session_res,
      metal_tone,
      side_setting,
    } = req.body;
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    let product: any = await req.body.db_connection.query(
      `(SELECT CEBP.id,side_setting_id,product_title,product_sort_des,product_long_des,
          sku,slug,CEBP.dia_cts,CEBP.dia_shape_id,CEBP.dia_clarity_id,CEBP.dia_cut_id,CEBP.dia_mm_id,CEBP.dia_color,
          diamond_group_id,product_size,product_length,product_combo_type,style_no,dia_type,id_stone,
          CEBP.labour_charge,CEBP.other_charge,CEBP.prod_dia_total_count,CEBP.alternate_dia_count,CEBP.dia_count,diamonds,metal,
          calculated_value as product_price,CEBP.metal_weight,CEBP.diamond_weight FROM eternity_band_configurator_price_view as CEBP
          WHERE side_setting_id = ${side_setting} 
          AND CEBP.company_info_id = ${company_info_id?.data}
          AND CEBP.dia_cts = ${caratSize} and CEBP.dia_shape_id = ${shape} and CEBP.dia_cut_id ${
        cut && cut != null ? `= ${cut}` : `IS NULL`
      } 
          and CEBP.dia_color ${
            color && color != null ? `= ${color}` : `IS NULL`
          } and CEBP.dia_clarity_id  ${
      clarity && clarity != null ? `= ${clarity}` : `IS NULL`
          // We use this because our payload contains combinations like January gemstone to February gemstone and vice versa, so we added this to handle both directions
      } and ${gemstone && gemstone.stone ? `CEBP.id_stone IN (${stone}, ${gemstone.stone})` : `CEBP.id_stone IN (${stone})`}
          AND CEBP.dia_type = ${diamond_type}
          AND product_size = '${ringSize}' AND metal_id = ${metal} AND karat_id ${karat && karat != null && karat != "" && karat != undefined ? `= ${karat}` : `IS NULL`}
          ${
            gemstone &&
            gemstone.stone &&
            gemstone.cut &&
            gemstone.stone != "" &&
            gemstone.cut != ""
              ? gemstone.stone == stone && gemstone.cut == cut
          ? `AND product_combo_type = 3`
          // We use this because our payload contains combinations like January gemstone to February gemstone and vice versa, so we added this to handle both directions
                : `AND CAST(diamonds ->> 'dia_stone' as integer) IN (${gemstone.stone}, ${stone}) 
                    AND  CAST(diamonds ->> 'dia_cuts' as integer) IN (${gemstone.cut}, ${cut})`
              : cut && cut != null
              ? `AND product_combo_type = 3`
              : `AND product_combo_type = 1`
          }
          )
          `,
      { type: QueryTypes.SELECT }
    );


    const data = {
      ...product[0],
      product_price: await req.formatPrice(product[0]?.product_price, PRICE_CORRECTION_PRODUCT_TYPE.EternityBandConfigurator),
    };
    return resSuccess({ data: data });
  } catch (error) {
    throw error;
  }
};

export const eternityProductPriceFindWithoutUsingMaterializedView = async (req: any) => {
  try {
    const {
      diamond_type,
      shape,
      stone,
      caratSize,
      color,
      clarity,
      cut,
      metal,
      karat,
      ringSize,
      length,
      gemstone,
      session_res,
      metal_tone,
      side_setting,
    } = req.body;
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const products:any = await req.body.db_connection.query(`( SELECT cebp.id,
    cebp.side_setting_id,
    cebp.product_title,
    cebp.product_sort_des,
    cebp.product_long_des,
    cebp.sku,
    cebp.slug,
    cebp.dia_cts,
    gemstones.name as stone_name,
    gemstones.is_diamond as stone_type,
    cebp.dia_shape_id,
    shape.name as shape_name,
    cebp.dia_clarity_id,
    clarity.value as clarity_name,
    cebp.dia_cut_id,
    cut.value as cut_name,
    cebp.dia_mm_id,
    cebp.dia_color,
    color.value as color_name,
    cebp.diamond_group_id,
    cebp.product_size,
    cebp.product_length,
    cebp.product_combo_type,
    cebp.style_no,
    cebp.id_stone,
    cebp.dia_type,
    cebp.labour_charge,
    cebp.other_charge,
    cebp.prod_dia_total_count,
    cebp.alternate_dia_count,
    cebp.dia_count,
    cebp.company_info_id,
    cebpmo.karat_id,
    cebpmo.metal_id,
    cebpdo.dia_cuts AS alt_dia_cuts,
    cuts.value AS alt_dia_cut_name,
    cebpdo.dia_stone AS alt_dia_stone,
    gem.name as alt_stone_name,
    gem.is_diamond as alt_stone_type,
    cebpdo.dia_cts AS alt_dia_cts,
    cebpdo.dia_shape AS alt_dia_shape,
    shapes.name as alt_shape_name,
    cebpdo.diamond_type AS alt_diamond_type,
    cebpdo.dia_weight AS alt_dia_weight,
    cebp.prod_dia_total_count * carat_sizes.value::double precision AS diamond_weight,
    cebpdo.dia_color AS alt_dia_color,
    colors.value AS alt_dia_color_name,
    cebpdo.dia_clarity AS alt_dia_clarity,
    clarities.value AS alt_dia_clarity_name,
    cebpmo.metal_wt AS metal_weight,
    cebpdo.id_diamond_group AS alt_id_diamond_group,
        CASE
            WHEN cebpdo.dia_stone IS NOT NULL THEN json_build_object('id', cebpdo.id, 'config_eternity_product_id',
             cebpdo.config_eternity_product_id, 'dia_clarity', cebpdo.dia_clarity, 'dia_color', cebpdo.dia_color,
              'dia_count', cebpdo.dia_count, 'dia_cts', cebpdo.dia_cts, 'dia_cuts', cebpdo.dia_cuts, 'dia_mm_size',
               cebpdo.dia_mm_size, 'dia_shape', cebpdo.dia_shape, 'dia_stone', cebpdo.dia_stone,
                'dia_weight', cebpdo.dia_weight, 'diamond_type', cebpdo.diamond_type, 'id_diamond_group',
                 cebpdo.id_diamond_group, 'rate', dgmp.rate,
                 'stone', gem.name, 'stone_type', gem.is_diamond, 'shape', shapes.name, 'clarity', clarities.value,
                  'color', colors.value, 'cut', cuts.value
                 )
            ELSE NULL::json
        END AS diamonds,
        CASE
            WHEN cebpmo.karat_id IS NULL THEN
            CASE
                WHEN cebp.product_combo_type = 1 OR cebp.product_combo_type = 3 THEN COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                    ELSE dgm.rate
                END * cebp.dia_count *
                CASE
                    WHEN gemstones.is_diamond = 1 THEN
                    CASE
                        WHEN dgm.average_carat IS NOT NULL OR dgm.average_carat <> 0::double precision THEN dgm.average_carat
                        ELSE carat_sizes.value::double precision
                    END
                    ELSE 1::double precision
                END, 0::double precision)
                ELSE COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgmp.synthetic_rate
                    ELSE dgmp.rate
                END * cebpdo.dia_count::double precision *
                CASE
                    WHEN gemstones.is_diamond = 1 THEN
                    CASE
                        WHEN dgm.average_carat IS NOT NULL OR dgm.average_carat <> 0::double precision THEN dgm.average_carat
                        ELSE carat_size_sd.value::double precision
                    END
                    ELSE 1::double precision
                END, 0::double precision) + COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                    ELSE dgm.rate
                END * cebp.dia_count *
                CASE
                    WHEN gemstones.is_diamond = 1 THEN
                    CASE
                        WHEN dgm.average_carat IS NOT NULL OR dgm.average_carat <> 0::double precision THEN dgm.average_carat
                        ELSE carat_sizes.value::double precision
                    END
                    ELSE 1::double precision
                END, 0::double precision)
            END + metal_masters.metal_rate * cebpmo.metal_wt + COALESCE(cebp.labour_charge, 0::double precision) + COALESCE(cebp.other_charge, 0::double precision)
            ELSE
            CASE
                WHEN cebp.product_combo_type = 1 OR cebp.product_combo_type = 3 THEN COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                    ELSE dgm.rate
                END * cebp.prod_dia_total_count *
                CASE
                    WHEN gemstones.is_diamond = 1 THEN
                    CASE
                        WHEN dgm.average_carat IS NOT NULL OR dgm.average_carat <> 0::double precision THEN dgm.average_carat
                        ELSE carat_sizes.value::double precision
                    END
                    ELSE 1::double precision
                END, 0::double precision)
                ELSE COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgmp.synthetic_rate
                    ELSE dgmp.rate
                END * cebpdo.dia_count::double precision *
                CASE
                    WHEN gemstones.is_diamond = 1 THEN
                    CASE
                        WHEN dgm.average_carat IS NOT NULL OR dgm.average_carat <> 0::double precision THEN dgm.average_carat
                        ELSE carat_size_sd.value::double precision
                    END
                    ELSE 1::double precision
                END, 0::double precision) + COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                    ELSE dgm.rate
                END * cebp.alternate_dia_count *
                CASE
                    WHEN gemstones.is_diamond = 1 THEN
                    CASE
                        WHEN dgm.average_carat IS NOT NULL OR dgm.average_carat <> 0::double precision THEN dgm.average_carat
                        ELSE carat_sizes.value::double precision
                    END
                    ELSE 1::double precision
                END, 0::double precision)
            END + metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.name::double precision / 24::double precision * cebpmo.metal_wt + COALESCE(cebp.labour_charge, 0::double precision) + COALESCE(cebp.other_charge, 0::double precision)
        END AS product_price
   FROM config_eternity_products cebp
     JOIN config_eternity_product_metals cebpmo ON cebpmo.config_eternity_id = cebp.id
     LEFT JOIN diamond_group_masters dgm ON dgm.id = cebp.diamond_group_id
     LEFT JOIN carat_sizes ON dgm.id_carat = carat_sizes.id
     LEFT JOIN gemstones ON gemstones.id = dgm.id_stone
     LEFT JOIN diamond_shapes shape ON shape.id = dgm.id_shape
     LEFT JOIN colors color ON color.id = dgm.id_color
     LEFT JOIN clarities clarity ON clarity.id = dgm.id_clarity
     LEFT JOIN cuts cut ON cut.id = dgm.id_cuts
     LEFT JOIN metal_masters ON metal_masters.id = cebpmo.metal_id
     LEFT JOIN gold_kts ON gold_kts.id = cebpmo.karat_id
     LEFT JOIN config_eternity_product_diamonds cebpdo ON cebpdo.config_eternity_product_id = cebp.id AND cebpdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgmp ON dgmp.id = cebpdo.id_diamond_group
     LEFT JOIN gemstones as gem ON gem.id = dgmp.id_stone
     LEFT JOIN diamond_shapes shapes ON shapes.id = dgmp.id_shape
     LEFT JOIN colors ON colors.id = dgmp.id_color
     LEFT JOIN clarities ON clarities.id = dgmp.id_clarity
     LEFT JOIN cuts ON cuts.id = dgmp.id_cuts
     LEFT JOIN carat_sizes carat_size_sd ON dgmp.id_carat = carat_size_sd.id
     WHERE cebp.is_deleted = '0'::"bit"
          AND side_setting_id = ${side_setting} 
          AND CEBP.company_info_id = ${company_info_id?.data}
          AND CEBP.dia_cts = ${caratSize} and CEBP.dia_shape_id = ${shape} and CEBP.dia_cut_id ${
        cut && cut != null ? `= ${cut}` : `IS NULL`
      } 
          and CEBP.dia_color ${
            color && color != null ? `= ${color}` : `IS NULL`
          } and CEBP.dia_clarity_id  ${
      clarity && clarity != null ? `= ${clarity}` : `IS NULL`
          // We use this because our payload contains combinations like January gemstone to February gemstone and vice versa, so we added this to handle both directions
      } and ${gemstone && gemstone.stone ? `CEBP.id_stone IN (${stone}, ${gemstone.stone})` : `CEBP.id_stone IN (${stone})`}
          AND CEBP.dia_type = ${diamond_type}
          AND product_size = '${ringSize}' AND metal_id = ${metal} AND karat_id ${karat && karat != null && karat != "" && karat != undefined ? `= ${karat}` : `IS NULL`}
          ${
            gemstone &&
            gemstone.stone &&
            gemstone.cut &&
            gemstone.stone != "" &&
            gemstone.cut != ""
              ? gemstone.stone == stone && gemstone.cut == cut
          ? `AND product_combo_type = 3`
          // We use this because our payload contains combinations like January gemstone to February gemstone and vice versa, so we added this to handle both directions
                : `AND cebpdo.dia_stone IN (${gemstone.stone}, ${stone}) 
                    AND  cebpdo.dia_cuts IN (${gemstone.cut}, ${cut})`
              : cut && cut != null
              ? `AND product_combo_type = 3`
              : `AND product_combo_type = 1`
          }
          )`, { type: QueryTypes.SELECT })
    
    if(!products[0] || products.length == 0){
      return resNotFound({message:PRODUCT_NOT_FOUND})
    }
const data:any = {
      ...products[0],
      product_price: await req.formatPrice(products[0]?.product_price, PRICE_CORRECTION_PRODUCT_TYPE.EternityBandConfigurator),
    };
  return resSuccess({data: data})
  } catch (error) {
    throw error
  }
}

export const getEternityProductDetailForUser = async (req: Request) => {
  try {
    const {ConfigEternityProduct,DiamondGroupMaster,ConfigEternityProductDiamondDetails,ConfigEternityProductMetalDetail, GoldKarat} = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const product = await ConfigEternityProduct.findOne({
      where: {
        slug: req.params.slug,
        is_deleted: DeletedStatus.No,
        company_info_id:company_info_id?.data,
      },
      attributes: [
        "id",
        "side_setting_id",
        "product_title",
        "product_sort_des",
        "product_long_des",
        "sku",
        "dia_cts",
        "dia_shape_id",
        "dia_clarity_id",
        "dia_cut_id",
        "style_no",
        "dia_mm_id",
        "dia_color",
        "labour_charge",
        "diamond_group_id",
        "product_size",
        "product_length",
        "product_combo_type",
        "slug",
        "discount_type",
        "discount_value",
        "dia_type",
        "id_stone",
        "labour_charge",
        "other_charge",
        "prod_dia_total_count",
        "alternate_dia_count",
        "dia_count",
        [Sequelize.literal(`"DiamondGroupMaster"."id_stone"`), "stone_id"],
        [
          Sequelize.literal(`"DiamondGroupMaster"."id_carat"`),
          "diamond_carat_id",
        ],
      ],
      include: [
        {
          required: false,
          model: DiamondGroupMaster,
          as: "DiamondGroupMaster",
          attributes: [],
          where:{company_info_id:company_info_id?.data},
        },
        {
          required: false,
          model: ConfigEternityProductDiamondDetails,
          where:{company_info_id:company_info_id?.data},
          attributes: [
            "id",
            "config_eternity_product_id",
            "dia_count",
            "dia_cts",
            "diamond_type",
            "id_diamond_group",
            "dia_weight",
            "dia_shape",
            "dia_stone",
            "dia_color",
            "dia_mm_size",
            "dia_clarity",
            "dia_cuts",
          ],
          as: "diamonds",
        },
        {
          required: false,
          model: ConfigEternityProductMetalDetail,
          where:{company_info_id:company_info_id?.data},
          attributes: [
            "id",
            "config_eternity_id",
            "metal_id",
            "metal_wt",
            "karat_id",
            "metal_tone",
            "labour_charge",
          ],
          as: "metal",
        },
      ],
    });

    if (!(product && product.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(DATA_NOT_FOUND, [
          ["field_name", "Product"],
        ]),
      });
    }

    return resSuccess({ data: product });
  } catch (error) {
    throw error;
  }
};
