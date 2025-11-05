import {
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../config/env.var";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import { moveFileToLocation } from "../../helpers/file.helper";
import DiamondShape from "../../model/master/attributes/diamondShape.model";
import Gemstones from "../../model/master/attributes/gemstones.model";
import MMSize from "../../model/master/attributes/mmSize.model";
import SideSettingStyles from "../../model/master/attributes/side-setting-styles.model";
import ProductBulkUploadFile from "../../model/product-bulk-upload-file.model";
import {
  FILE_STATUS,
  FILE_BULK_UPLOAD_TYPE,
  DeletedStatus,
  DIAMOND_TYPE,
  EternityProductCombinationType,
  ActiveStatus,
  AllProductTypes,
} from "../../utils/app-enumeration";
import {
  FILE_NOT_FOUND,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  DEFAULT_STATUS_CODE_SUCCESS,
  INVALID_HEADER,
  DATA_NOT_FOUND,
  REQUIRED_ERROR_MESSAGE,
  ERROR_NOT_FOUND,
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
} from "../../utils/shared-functions";
import MetalTone from "../model/master/attributes/metal/metalTone.model";
import { Request } from "express";
import CaratSize from "../../model/master/attributes/caratSize.model";
import {
  CONFIG_PRODUCT_GEMSTONE_DETAILS,
  CONFIG_PRODUCT_DIAMOND_DETAILS,
  CONFIG_PRODUCT_METAL_DETAILS,
} from "../../utils/app-constants";
import ClarityData from "../model/master/attributes/clarity.model";
import Colors from "../model/master/attributes/colors.model";
import CutsData from "../model/master/attributes/cuts.model";
import DiamondGroupMaster from "../model/master/attributes/diamond-group-master.model";
import dbContext from "../../config/db-context";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import ConfigEternityProduct from "../model/config-eternity-product.model";
import ConfigEternityProductDiamondDetails from "../model/config-eternity-product-diamonds.model";
import ConfigEternityProductMetalDetail from "../model/config-eternity-product-metals.model";
import ItemSizeData from "../model/master/attributes/item-size.model";
import { Op, Sequelize } from "sequelize";
import ItemLengthData from "../../model/master/attributes/item-length.model";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import DiamondCaratSize from "../model/master/attributes/caratSize.model";
import StoneData from "../model/master/attributes/gemstones.model";
const readXlsxFile = require("read-excel-file/node");

export const addConfigEternityProduct = async (req: Request) => {
  try {
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
      req.file.originalname
    );

    if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resMFTL;
    }

    const resPBUF = await ProductBulkUploadFile.create({
      file_path: resMFTL.data,
      status: FILE_STATUS.Uploaded,
      file_type: FILE_BULK_UPLOAD_TYPE.ConfigProductUpload,
      created_by: req.body.session_res.id_app_user,
      created_date: getLocalDate(),
    });

    const PPBUF = await processProductBulkUploadFile(
      resPBUF.dataValues.id,
      resMFTL.data,
      req.body.session_res.id_app_user
    );

    return PPBUF;
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

const processProductBulkUploadFile = async (
  id: number,
  path: string,
  idAppUser: number
) => {
  try {
    const data = await processCSVFile(path, idAppUser);
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

const processCSVFile = async (path: string, idAppUser: number) => {
  try {
    const resRows = await getArrayOfRowsFromCSVFile(path);
    if (resRows.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resRows;
    }

    const resVH = await validateHeaders(resRows.data.headers);

    if (resVH.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resVH;
    }
    const resProducts = await getProductsFromRows(resRows.data.results);

    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addProductToDB(resProducts.data, idAppUser);
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
          row && row.forEach((header: any) => {
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

const getProductsFromRows = async (rows: any) => {
  let currentProductIndex = -1;
  let productList: any = [];
  let where = { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No };
  try {
    let errors: {
      style_no: any;
      error_message: string;
    }[] = [];

    const settingList = await SideSettingStyles.findAll({ where });

    const gemstoneList = await Gemstones.findAll({
      where,
    });
    const diamondShapeList = await DiamondShape.findAll({
      where,
    });
    const caratSizeList = await CaratSize.findAll({
      where,
    });
    const mmSizeList = await MMSize.findAll({
      where,
    });
    const metalMaster = await MetalMaster.findAll({
      where,
    });
    const karatMaster = await GoldKarat.findAll({
      where,
    });
    const productSize = await ItemSizeData.findAll({
      where,
    });
    const productLength = await ItemLengthData.findAll({
      where,
    });
    const diamondColorList = await Colors.findAll({ where });
    const diamondClarityList = await ClarityData.findAll({ where });
    const gemstoneCutList = await CutsData.findAll({ where });
    const diamondGroupMaster = await DiamondGroupMaster.findAll({
      where: { is_deleted: DeletedStatus.No },
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

        if (errors.length === 0) {
          data.push({
            ...element,
            stone: stone.data,
            stone_name: element.stone,
            dia_shape: diaShape.data,
            dia_carat: diaCarat.data,
            dia_mm_size:
              diaMmSize &&
              diaMmSize !== null &&
              diaMmSize !== undefined &&
              diaMmSize.data != 0
                ? diaMmSize.data
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

const addProductToDB = async (productList: any, idAppUser: number) => {
  const trn = await dbContext.transaction();
  let resProduct,
    prodMetalPayload: any = [],
    productDiamondPayload: any = [];
  const where = {
    is_active: ActiveStatus.Active,
    is_deleted: DeletedStatus.No,
  };

  try {
    const sideSetting = await SideSettingStyles.findAll({
      where,
    });
    const stone = await Gemstones.findAll({
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
    const caratMaster = await CaratSize.findAll({
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
    const stoneMaster = await Gemstones.findAll({
      where,
    });
    const productSizeMaster = await ItemSizeData.findAll({
      where,
    });
    const productLengthMaster = await ItemLengthData.findAll({
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

      let slug = product_name.toLocaleLowerCase().replaceAll(" ", "-");

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
        },
        { transaction: trn }
      );

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
      });
    }

    await ConfigEternityProductDiamondDetails.bulkCreate(
      productDiamondPayload,
      {
        transaction: trn,
      }
    );
    await ConfigEternityProductMetalDetail.bulkCreate(prodMetalPayload, {
      transaction: trn,
    });

    await trn.commit();
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
  returnValue: string
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
    let paginationProps = {};
    const { product_type = "Eternity Band" } = req.query;

    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
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
        "side_setting_id",
        "product_title",
        "product_sort_des",
        "product_long_des",
        "sku",
        "dia_cts",
        "dia_shape_id",
        "dia_clarity_id",
        "style_no",
        "dia_cut_id",
        "dia_mm_id",
        "dia_color",
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
        },
        {
          required: false,
          model: DiamondShape,
          as: "diamond_shape",
          attributes: [],
        },
        {
          required: false,
          model: CutsData,
          as: "diamond_cut",
          attributes: [],
        },
        {
          required: false,
          model: Colors,
          as: "diamond_color",
          attributes: [],
        },
        {
          required: false,
          model: ClarityData,
          as: "diamond_clarity",
          attributes: [],
        },
        {
          required: false,
          model: DiamondGroupMaster,
          as: "DiamondGroupMaster",
          attributes: [],
          include: [
            {
              required: false,
              model: StoneData,
              as: "stones",
              attributes: [],
            },
            {
              required: false,
              model: DiamondCaratSize,
              as: "carats",
              attributes: [],
            },
          ],
        },
        {
          model: ConfigEternityProductDiamondDetails,
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
          model: ConfigEternityProductMetalDetail,
          attributes: [
            "id",
            "config_eternity_id",
            "metal_id",
            "metal_wt",
            "karat_id",
            "metal_tone",
          ],
          as: "metal",
        },
      ],
    });

    return resSuccess({ data: { pagination, productList: result } });
  } catch (error) {
    throw error;
  }
};

export const getEternityProduct = async (req: Request) => {
  try {
    const product = await ConfigEternityProduct.findOne({
      where: {
        id: req.params.product_id,
        is_deleted: DeletedStatus.No,
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
        },
        {
          required: false,
          model: DiamondShape,
          as: "diamond_shape",
          attributes: [],
        },
        {
          required: false,
          model: CutsData,
          as: "diamond_cut",
          attributes: [],
        },
        {
          required: false,
          model: Colors,
          as: "diamond_color",
          attributes: [],
        },
        {
          required: false,
          model: ClarityData,
          as: "diamond_clarity",
          attributes: [],
        },
        {
          required: false,
          model: DiamondGroupMaster,
          as: "DiamondGroupMaster",
          attributes: [],
          include: [
            {
              required: false,
              model: StoneData,
              as: "stones",
              attributes: [],
            },
            {
              required: false,
              model: DiamondCaratSize,
              as: "carats",
              attributes: [],
            },
          ],
        },
        {
          model: ConfigEternityProductDiamondDetails,
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
            },
            {
              model: Colors,
              as: "color",
              attributes: [],
            },
            {
              model: ClarityData,
              as: "clarity",
              attributes: [],
            },
            {
              model: CutsData,
              as: "cuts",
              attributes: [],
            },
            {
              model: StoneData,
              as: "stone",
              attributes: [],
            },
            {
              model: DiamondCaratSize,
              as: "carat",
              attributes: [],
            },
            {
              model: DiamondGroupMaster,
              as: "DiamondGroup",
              attributes: [],
            },
          ],
        },
        {
          model: ConfigEternityProductMetalDetail,
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
                `CASE WHEN karat_id IS NULL THEN (metal_wt*"metal->MetalMaster"."metal_rate") ELSE metal_wt*("metal->MetalMaster"."metal_rate"/31.104*"metal->KaratMaster"."name"/24) END`
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
            },
            {
              model: MetalMaster,
              as: "MetalMaster",
              attributes: [],
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

export const deleteProduct = async (req: Request) => {
  try {
    const product = await ConfigEternityProduct.findOne({
      where: {
        id: req.params.product_id,
        is_deleted: DeletedStatus.No,
      },
      include: [
        {
          model: ConfigEternityProductDiamondDetails,
          attributes: [],
          as: "diamonds",
        },
        {
          model: ConfigEternityProductMetalDetail,
          attributes: [],
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

    await ConfigEternityProduct.update(
      { is_deleted: DeletedStatus.yes },
      { where: { id: req.params.product_id } }
    );

    await ConfigEternityProductDiamondDetails.update(
      { is_deleted: DeletedStatus.yes },
      { where: { config_eternity_product_id: req.params.product_id } }
    );

    await ConfigEternityProductMetalDetail.update(
      { is_deleted: DeletedStatus.yes },
      { where: { config_eternity_id: req.params.product_id } }
    );

    return resSuccess();
  } catch (error) {
    throw error;
  }
};

export const eternityPriceFind = async (req: Request) => {
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
    } = req.body;

    const { product_type = "Eternity Band" } = req.query;

    let product;
    const productAttribute: any = [
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
      "dia_mm_id",
      "dia_color",
      "diamond_group_id",
      "product_size",
      "product_length",
      "product_combo_type",
      "style_no",
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
      [
        Sequelize.literal(`
          (SELECT CASE 
            WHEN id IS NULL THEN NULL 
            ELSE id 
          END 
          FROM wishlist_products 
          WHERE product_id = "config_eternity_products"."id" 
            AND product_type = ${AllProductTypes.Eternity_product} 
            AND user_id = ${
              session_res.id_app_user &&
              session_res.id_app_user != undefined &&
              session_res.id_app_user != null &&
              session_res.id_app_user != "undefined" &&
              session_res.id_app_user != "null"
                ? `'${session_res.id_app_user}'`
                : "NULL"
            } 
            AND id_metal_tone = ${
              metal_tone &&
              metal_tone != "null" &&
              metal_tone != null &&
              metal_tone != undefined
                ? `'${metal_tone}'`
                : "NULL"
            })
        `),
        "wishlist_id",
      ],
    ];
    const metalAttribute = [
      "id",
      "config_eternity_id",
      "metal_id",
      "metal_wt",
      "karat_id",
      "metal_tone",
    ];
    const diamondAttribute = [
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
    ];

    if (gemstone && gemstone.stone !== stone) {
      product = await ConfigEternityProduct.findOne({
        where: [
          { dia_color: color },
          { dia_clarity_id: clarity },
          { id_stone: stone },
          { dia_cut_id: cut },
          { dia_cts: caratSize },
          { dia_shape_id: shape },
          { product_size: `${ringSize}` },
          length ? { product_length: length } : {},
          { dia_type: diamond_type },
          { product_type: product_type },
          { is_deleted: DeletedStatus.No },
          {
            [Op.or]: [
              {
                product_combo_type:
                  EternityProductCombinationType.DiamondGemstone,
              },
              {
                product_combo_type:
                  EternityProductCombinationType.GemstoneGemstone,
              },
            ],
          },
        ],
        attributes: [
          ...productAttribute,
          [
            Sequelize.literal(
              `CASE 
                WHEN ${diamond_type} = 1 THEN "DiamondGroupMaster"."rate"
                ELSE "DiamondGroupMaster"."synthetic_rate"
                END`
            ),
            "rate",
          ],
        ],
        include: [
          {
            model: ConfigEternityProductDiamondDetails,
            as: "diamonds",
            where: {
              dia_cuts: gemstone.cut,
              dia_stone: gemstone.stone,
              dia_cts: caratSize,
              dia_shape: shape,
              diamond_type: diamond_type,
            },
            attributes: [
              ...diamondAttribute,
              [
                Sequelize.literal(
                  `CASE 
                    WHEN ${diamond_type} = 1 THEN "diamonds->DiamondGroup"."rate"
                    ELSE "diamonds->DiamondGroup"."synthetic_rate"
                    END`
                ),
                "rate",
              ],
            ],
            include: [
              {
                model: DiamondGroupMaster,
                as: "DiamondGroup",
                attributes: [],
              },
            ],
          },
          {
            model: ConfigEternityProductMetalDetail,
            as: "metal",
            where: {
              metal_id: metal,
              karat_id: karat,
            },
            attributes: [
              ...metalAttribute,
              [
                Sequelize.literal(`"metal->MetalMaster"."metal_rate"`),
                "metal_rate",
              ],
              [Sequelize.literal(`"metal->KaratMaster"."name"`), "karat_value"],
            ],
            include: [
              {
                model: MetalMaster,
                as: "MetalMaster",
                attributes: [],
              },
              {
                model: GoldKarat,
                as: "KaratMaster",
                attributes: [],
              },
            ],
          },
          {
            model: DiamondGroupMaster,
            as: "DiamondGroupMaster",
            attributes: [],
          },
        ],
      });
      if (!(product && product.dataValues)) {
        product = await ConfigEternityProduct.findOne({
          where: [
            { dia_color: color },
            { dia_clarity_id: clarity },
            { id_stone: gemstone.stone },
            { dia_cut_id: gemstone.cut },
            { dia_cts: caratSize },
            { dia_shape_id: shape },
            { product_size: `${ringSize}` },
            length ? { product_length: length } : {},
            { dia_type: diamond_type },
            req.query.product_type
              ? { product_type: req.query.product_type }
              : {},
            { is_deleted: DeletedStatus.No },
            {
              [Op.or]: [
                {
                  product_combo_type:
                    EternityProductCombinationType.DiamondGemstone,
                },
                {
                  product_combo_type:
                    EternityProductCombinationType.GemstoneGemstone,
                },
              ],
            },
          ],
          attributes: [
            ...productAttribute,
            [
              Sequelize.literal(
                `CASE 
                  WHEN ${diamond_type} = 1 THEN "DiamondGroupMaster"."rate"
                  ELSE "DiamondGroupMaster"."synthetic_rate"
                  END`
              ),
              "rate",
            ],
          ],
          include: [
            {
              model: ConfigEternityProductDiamondDetails,
              as: "diamonds",
              where: {
                dia_cuts: cut,
                dia_stone: stone,
                dia_cts: caratSize,
                dia_shape: shape,
                diamond_type: diamond_type,
              },
              attributes: [
                ...diamondAttribute,
                [
                  Sequelize.literal(
                    `CASE 
                      WHEN ${diamond_type} = 1 THEN "diamonds->DiamondGroup"."rate"
                      ELSE "diamonds->DiamondGroup"."synthetic_rate"
                      END`
                  ),
                  "rate",
                ],
              ],
              include: [
                {
                  model: DiamondGroupMaster,
                  as: "DiamondGroup",
                  attributes: [],
                },
              ],
            },
            {
              model: ConfigEternityProductMetalDetail,
              as: "metal",
              where: {
                metal_id: metal,
                karat_id: karat,
              },
              attributes: [
                ...metalAttribute,
                [
                  Sequelize.literal(`"metal->MetalMaster"."metal_rate"`),
                  "metal_rate",
                ],
                [
                  Sequelize.literal(`"metal->KaratMaster"."name"`),
                  "karat_value",
                ],
              ],
              include: [
                {
                  model: MetalMaster,
                  as: "MetalMaster",
                  attributes: [],
                },
                {
                  model: GoldKarat,
                  as: "KaratMaster",
                  attributes: [],
                },
              ],
            },
            {
              model: DiamondGroupMaster,
              as: "DiamondGroupMaster",
              attributes: [],
            },
          ],
        });
      }
    } else {
      product = await ConfigEternityProduct.findOne({
        where: [
          { dia_color: color },
          { dia_cut_id: cut },
          { dia_clarity_id: clarity },
          { id_stone: stone },
          { dia_cts: caratSize },
          { dia_shape_id: shape },
          { product_size: `${ringSize}` },
          length ? { product_length: length } : {},
          { dia_type: diamond_type },
          req.query.product_type
            ? { product_type: req.query.product_type }
            : {},
          { is_deleted: DeletedStatus.No },
          {
            [Op.or]: [
              {
                product_combo_type: EternityProductCombinationType.Diamond,
              },
              {
                product_combo_type: EternityProductCombinationType.Gemstone,
              },
            ],
          },
        ],
        attributes: [
          ...productAttribute,
          [
            Sequelize.literal(
              `CASE 
                WHEN ${diamond_type} = 1 THEN "DiamondGroupMaster"."rate"
                ELSE "DiamondGroupMaster"."synthetic_rate"
                END`
            ),
            "rate",
          ],
        ],
        include: [
          {
            model: ConfigEternityProductMetalDetail,
            as: "metal",
            where: {
              metal_id: metal,
              karat_id: karat,
            },
            attributes: [
              ...metalAttribute,
              [
                Sequelize.literal(`"metal->MetalMaster"."metal_rate"`),
                "metal_rate",
              ],
              [Sequelize.literal(`"metal->KaratMaster"."name"`), "karat_value"],
            ],
            include: [
              {
                model: MetalMaster,
                as: "MetalMaster",
                attributes: [],
              },
              {
                model: GoldKarat,
                as: "KaratMaster",
                attributes: [],
              },
            ],
          },
          {
            model: DiamondGroupMaster,
            as: "DiamondGroupMaster",
            attributes: [],
          },
        ],
      });
    }

    if (!product) {
      return resNotFound({
        message: prepareMessageFromParams(DATA_NOT_FOUND, [
          ["field_name", "Product"],
        ]),
      });
    }

    const {
      labour_charge,
      other_charge,
      product_combo_type,
      dia_cts,
      prod_dia_total_count,
      alternate_dia_count,
      dia_count,
      rate,
    } = product.dataValues;
    const { metal_wt, karat_value, metal_rate } = product.metal.dataValues;
    const carat = await CaratSize.findOne({
      where: {
        id: dia_cts,
      },
      attributes: ["value"],
    });

    const metalRate = karat_value
      ? (metal_rate / 31.104) * (Number(karat_value) / 24) * metal_wt
      : metal_rate * metal_wt;
    console.log(
      "rate * Number(carat.dataValues.value) * dia_count",
      prod_dia_total_count
    );
    const diamondRate =
      product_combo_type === 1 || product_combo_type === 3
        ? rate * Number(carat.dataValues.value) * prod_dia_total_count
        : rate * dia_count * Number(carat.dataValues.value) +
          product.diamonds.dataValues.rate *
            Number(carat.dataValues.value) *
            alternate_dia_count;

    product.dataValues.product_price =
      metalRate + diamondRate + (other_charge || 0) + (labour_charge || 0);

    return resSuccess({ data: product });
  } catch (error) {
    throw error;
  }
};

export const getEternityProductDetailForUser = async (req: Request) => {
  try {
    const product = await ConfigEternityProduct.findOne({
      where: {
        slug: req.params.slug,
        is_deleted: DeletedStatus.No,
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
        },
        {
          model: ConfigEternityProductDiamondDetails,
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
          model: ConfigEternityProductMetalDetail,
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
