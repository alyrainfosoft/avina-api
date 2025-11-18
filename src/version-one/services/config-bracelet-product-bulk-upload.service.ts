import { Request } from "express";
import {
  addActivityLogs,
  columnValueLowerCase,
  getCompanyIdBasedOnTheCompanyKey,
  getInitialPaginationFromQuery,
  getLocalDate,
  prepareMessageFromParams,
  refreshMaterializedBraceletConfiguratorPriceFindView,
  resBadRequest,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../utils/shared-functions";
import {
  DATA_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  ERROR_NOT_FOUND,
  FILE_NOT_FOUND,
  INVALID_HEADER,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  PRODUCT_NOT_FOUND,
  RECORD_DELETE_SUCCESSFULLY,
  REQUIRED_ERROR_MESSAGE,
} from "../../utils/app-messages";
import {
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../config/env.var";
import { moveFileToLocation } from "../../helpers/file.helper";
import {
  ActiveStatus,
  AllProductTypes,
  DeletedStatus,
  DIAMOND_TYPE,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  LogsActivityType,
  LogsType,
  PRICE_CORRECTION_PRODUCT_TYPE,
} from "../../utils/app-enumeration";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import {
  BRACELET_CONFIG_PRODUCT_DIAMOND_DETAILS,
  CONFIG_PRODUCT_GEMSTONE_DETAILS,
  CONFIG_PRODUCT_METAL_DETAILS,
} from "../../utils/app-constants";
import { initModels } from "../model/index.model";
import { Op, QueryTypes, Sequelize } from "sequelize";
const readXlsxFile = require("read-excel-file/node");
export const addConfigBraceletProduct = async (req: Request) => {
  try {
    const {ProductBulkUploadFile,Image} = initModels(req);
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
    const {ProductBulkUploadFile} = initModels(req);

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

const processCSVFile = async (path: string, idAppUser: number,clientId:number, req: Request) => {
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

    return resSuccess({ data: resProducts.data });
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
              product_style: row[2],
              style_no: row[3],
              bracelet_no: row[4],
              product_length: row[5],
              setting_type: row[6],
              hook_type: row[7],
              dia_display_wt: row[8],
              alternate_stone: row[9],
              product_dia_type: row[10],
              product_dia_shape: row[11],
              product_dia_mm_size: row[12],
              product_dia_carat: row[13],
              product_dia_count: row[14],
              natural_dia_clarity_color: row[15],
              lab_grown_dia_clarity_color: row[16],
              natural_january: row[17],
              synthetic_january: row[18],
              natural_february: row[19],
              synthetic_february: row[20],
              natural_march: row[21],
              synthetic_march: row[22],
              natural_april: row[23],
              synthetic_april: row[24],
              natural_may: row[25],
              synthetic_may: row[26],
              natural_june: row[27],
              synthetic_june: row[28],
              natural_july: row[29],
              synthetic_july: row[30],
              natural_august: row[31],
              synthetic_august: row[32],
              natural_september: row[33],
              synthetic_september: row[34],
              natural_october: row[35],
              synthetic_october: row[36],
              natural_november: row[37],
              synthetic_november: row[38],
              natural_december: row[39],
              synthetic_december: row[40],
              metal_weight_type: row[41],
              KT_9: row[42],
              KT_10: row[43],
              KT_14: row[44],
              KT_18: row[45],
              KT_22: row[46],
              silver: row[47],
              platinum: row[48],
              labour_charge: row[49],
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
    "product_style",
    "style_no",
    "bracelet_no",
    "product_length",
    "setting_type",
    "hook_type",
    "dia_display_wt",
    "alternate_stone",
    "product_dia_type",
    "product_dia_shape",
    "product_dia_mm_size",
    "product_dia_carat",
    "product_dia_count",
    "natural_dia_clarity_color",
    "lab_grown_dia_clarity_color",
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
    "metal_weight_type",
    "KT_9",
    "KT_10",
    "KT_14",
    "KT_18",
    "KT_22",
    "silver",
    "platinum",
    "labour_charge",
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
const getProductsFromRows = async (rows: any,client_id:any, req: Request) => {
  let currentProductIndex = -1;
  let productList: any = [];
    const {SideSettingStyles,HookTypeData,StoneData,DiamondShape,DiamondCaratSize,MMSizeData,MetalMaster,GoldKarat,LengthData,Colors,ClarityData,CutsData,DiamondGroupMaster} = initModels(req);

  let where = { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No,company_info_id: client_id };
  try {
    let errors: {
      style_no: any;
      error_message: string;
    }[] = [];

    const settingList = await SideSettingStyles.findAll({ where });
    const hookTypeList = await HookTypeData.findAll({ where });
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
    const productLength = await LengthData.findAll({
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
        const caratSize = await getIdFromName(
          row.dia_display_wt,
          caratSizeList,
          "value",
          "Display diamond weight"
        );
        if (caratSize.error && caratSize.error !== null) {
          errors.push({
            style_no: row.style_no,
            error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
              ["field_name", "Display diamond weight"],
            ]),
          });
        }
        if (row.hook_type == null) {
          errors.push({
            style_no: row.style_no,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Hook Type"],
            ]),
          });
        }

        const hook_type = await getIdFromName(
          row.hook_type,
          hookTypeList,
          "name",
          "Hook Type"
        );
        if (hook_type && hook_type.error && hook_type.error !== null) {
          errors.push({
            style_no: row.style_no,
            error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
              ["field_name", "Hook type"],
            ]),
          });
        }

        let product_length;
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

        currentProductIndex++;
        productList.push({
          setting_type: setting_type.data,
          product_type: row.product_type.toLocaleLowerCase(),
          product_style: row.product_style.toLocaleLowerCase(),
          hook_type: hook_type ? hook_type.data : null,
          product_length: product_length ? product_length.data : null,
          product_total_diamond: row.product_total_dia_count,
          style_no: row.style_no,
          bracelet_no: row.bracelet_no,
          product_name: "",
          dia_display_wt: caratSize ? caratSize.data : null,
          long_description: row.long_description,
          sort_description: row.short_description,
          product_dia_type: "",
          product_metal_details: {
            product9KTList: [],
            product10KTList: [],
            product14KTList: [],
            product18KTList: [],
            product22KTList: [],
            productSilverList: [],
            productPlatinumList: [],
          },
          product_diamond_details: [],
          product_fixed_diamond_details: [],
          alternate_stone_diamond_details: [],
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
const createProductVariant = (productList: any) => {
  try {
    const productData = [];
    const variantProductList = [];
    for (let index = 0; index < productList.length; index++) {
      const element = productList[index];

      const groupedData = [];

      if (element.product_fixed_diamond_details == 0) {
        productData.push({ ...element });
      } else {
        productList[index].product_fixed_diamond_details.forEach(
          (item: any) => {
            // Find if a group with the same dia_group exists
            let group = groupedData.find(
              (group) =>
                group[0].product_dia_color === item.product_dia_color &&
                group[0].product_dia_clarity === item.product_dia_clarity &&
                group[0].diamond_type === item.diamond_type
            );

            // If the group doesn't exist, create a new one
            if (!group) {
              group = [];
              groupedData.push(group);
            }

            // Add the current item to the group
            group.push(item);
          }
        );
        for (let j = 0; j < groupedData.length; j++) {
          const value = groupedData[j];

          productData.push({
            ...element,
            product_fixed_diamond_details: value,
          });
          if (
            element.alternate_stone_diamond_details.length == 0 &&
            element.product_diamond_details.length == 0 &&
            element.product_fixed_diamond_details.length > 0
          ) {
            variantProductList.push({
              ...element,
              product_dia_type: value[0].diamond_type,
              product_fixed_diamond_details: value,
            });
          }
        }
      }
    }

    for (let j = 0; j < productData.length; j++) {
      const element = productData[j];
      const alternateGemstoneList = [];
      if (
        element.product_diamond_details.length > 0 &&
        element.product_fixed_diamond_details.length > 0 &&
        element.alternate_stone_diamond_details.length == 0
      ) {
       
        for (let k = 0; k < element.product_diamond_details.length; k++) {
          const value = element.product_diamond_details[k];
          if (value.diamond_type == element.product_fixed_diamond_details[0].diamond_type) {
            variantProductList.push({
              ...element,
              product_dia_type: value.diamond_type,
              product_diamond_details: [
                ...element.product_fixed_diamond_details,
                value,
              ],
            });
          }
        }
      }
      else if (
        element.product_diamond_details.length > 0 &&
        element.product_fixed_diamond_details.length == 0 &&
        element.alternate_stone_diamond_details.length > 0
      ) {
        for (
          let index = 0;
          index < element.product_diamond_details.length;
          index++
        ) {
          for (
            let j = 0;
            j < element.alternate_stone_diamond_details.length;
            j++
          ) {
            if (
              (element.product_diamond_details[index].stone ===
                element.alternate_stone_diamond_details[j].stone &&
                element.product_diamond_details[index].diamond_type ===
                  element.alternate_stone_diamond_details[j].diamond_type) ||
              (element.product_diamond_details[index].stone !==
                element.alternate_stone_diamond_details[j].stone &&
                element.product_diamond_details[index].diamond_type ===
                  element.alternate_stone_diamond_details[j].diamond_type)
            ) {
              alternateGemstoneList.push([
                element.product_diamond_details[index],
                element.alternate_stone_diamond_details[j],
              ]);
            }
          }
        }
      }

      const uniqueGemstoneVariant = Array.from(
        new Set(alternateGemstoneList.map((obj) => JSON.stringify(obj)))
      ).map((str) => JSON.parse(str));

      for (let k = 0; k < uniqueGemstoneVariant.length; k++) {
        variantProductList.push({
          ...element,
          product_dia_type: element.product_diamond_details[0].diamond_type,
          product_diamond_details: uniqueGemstoneVariant[k],
        });
      }
    }
    return variantProductList;
  } catch (error) {
    throw error;
  }
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
      const alternateCutArray = [];
      for (
        let j = 0;
        j < productList[index].product_fixed_diamond_details.length;
        j++
      ) {
        if (
          productList[index].product_fixed_diamond_details[j]
            .product_dia_color &&
          productList[index].product_fixed_diamond_details[j].product_dia_color
            .length > 0
        ) {
          for (
            let k = 0;
            k <
            productList[index].product_fixed_diamond_details[j]
              .product_dia_color.length;
            k++
          ) {
            const color =
              productList[index].product_fixed_diamond_details[j]
                .product_dia_color[k];
            const clarity =
              productList[index].product_fixed_diamond_details[j]
                .product_dia_clarity[k];
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
                  productList[index].product_fixed_diamond_details[j].stone &&
                t.dataValues.id_shape ==
                  productList[index].product_fixed_diamond_details[j]
                    .product_dia_shape &&
                t.dataValues.id_color == (colorData.data ? colorData.data : null) &&
                t.dataValues.id_clarity == (clarityData.data ? clarityData.data : null) &&
                t.dataValues.id_cuts ==
                  productList[index].product_fixed_diamond_details[j]
                    .dia_cuts &&
                t.dataValues.min_carat_range <=
                  productList[index].product_fixed_diamond_details[j]
                    .product_dia_wt &&
                t.dataValues.max_carat_range >=
                  productList[index].product_fixed_diamond_details[j]
                    .product_dia_wt
            );
            
            if (!(diamondGroup && diamondGroup.dataValues)) {


              errors.push({
                style_no: productList[index].style_no,
                error_message: `${productList[index].product_fixed_diamond_details[j].stone}-(${productList[index].product_fixed_diamond_details[j].product_dia_wt}) Diamond group not found`,
              });
            }

            if (errors.length === 0) {
              productColorClarityArray.push({
                ...productList[index].product_fixed_diamond_details[j],
                product_dia_color: colorData.data,
                product_dia_clarity: clarityData.data,
                dia_group: diamondGroup.dataValues.id,
                id_carat: diamondGroup.dataValues.id_carat,
              });
            }
          }
        }
      }

      productList[index].product_fixed_diamond_details =
        productColorClarityArray;

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
                  productList[index].product_diamond_details[j]
                    .product_dia_shape &&
                t.dataValues.min_carat_range <=
                  productList[index].product_diamond_details[j]
                    .product_dia_wt &&
                t.dataValues.max_carat_range >=
                  productList[index].product_diamond_details[j]
                    .product_dia_wt &&
                t.dataValues.id_cuts == cutData.data
            );

            if (!(diamondGroup && diamondGroup.dataValues)) {
              errors.push({
                style_no: productList[index].style_no,
                error_message: `${productList[index].product_diamond_details[j].stone}-(${productList[index].product_diamond_details[j].product_dia_wt}) Diamond group not found`,
              });
            }
            if (errors.length === 0) {
              productCutArray.push({
                ...productList[index].product_diamond_details[j],
                dia_cuts: cutData.data,
                dia_group: diamondGroup.dataValues.id,
                id_carat: diamondGroup.dataValues.id_carat,
              });
            }
          }
        }
      }
      productList[index].product_diamond_details = productCutArray;

      for (
        let j = 0;
        j < productList[index].alternate_stone_diamond_details.length;
        j++
      ) {
        if (
          productList[index].alternate_stone_diamond_details[j].dia_cuts &&
          productList[index].alternate_stone_diamond_details[j].dia_cuts
            .length > 0
        ) {
          for (
            let k = 0;
            k <
            productList[index].alternate_stone_diamond_details[j].dia_cuts
              .length;
            k++
          ) {
            const cuts =
              productList[index].alternate_stone_diamond_details[j].dia_cuts[k];
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
                  productList[index].alternate_stone_diamond_details[j].stone &&
                t.dataValues.id_shape ==
                  productList[index].alternate_stone_diamond_details[j]
                    .product_dia_shape &&
                t.dataValues.min_carat_range <=
                  productList[index].alternate_stone_diamond_details[j]
                    .product_dia_wt &&
                t.dataValues.max_carat_range >=
                  productList[index].alternate_stone_diamond_details[j]
                    .product_dia_wt &&
                t.dataValues.id_cuts == cutData.data
            );

            if (!(diamondGroup && diamondGroup.dataValues)) {
              errors.push({
                style_no: productList[index].style_no,
                error_message: `${productList[index].alternate_stone_diamond_details[j].stone}- (${productList[index].alternate_stone_diamond_details[j].product_dia_wt}) Diamond group not found`,
              });
            }
            if (errors.length === 0) {
              alternateCutArray.push({
                ...productList[index].alternate_stone_diamond_details[j],
                dia_cuts: cutData.data,
                dia_group: diamondGroup.dataValues.id,
                id_carat: diamondGroup.dataValues.id_carat,
              });
            }
          }
        }
      }
      productList[index].alternate_stone_diamond_details = alternateCutArray;
    }

    if (errors && errors.length > 1) {
      return await resBadRequest({ data: errors });
    }
    return resSuccess({ data: productList });
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
  try {
    let errors: {
      style_no: any;
      error_message: string;
    }[] = [];
    let where = { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No };
    let productData = [];

    for (let index = 0; index < productList.length; index++) {
      const element: any[] = productList[index].product_fixed_diamond_details;

      const diamondList = [];
      const stoneList = [];
      const alternateStoneList = [];
      // if (
      //   element.length > 0 ||
      //   productList[index].product_diamond_details.length > 0 ||

      // ) {
      if (element.length > 0) {
        for (let j = 0; j < element.length; j++) {
          const stone = await getIdFromName(
            element[j].stone,
            gemstoneList,
            "name",
            "product type"
          );
          if (stone.error && stone.error !== null) {
            errors.push({
              style_no: productList[index].style_no,
              error_message: stone.error,
            });
          }
          const diamondShape = await getIdFromName(
            element[j].product_dia_shape,
            diamondShapeList,
            "name",
            "product Diamond Shape"
          );

          if (diamondShape.error && diamondShape.error !== null) {
            errors.push({
              style_no: productList[index].style_no,
              error_message: diamondShape.error,
            });
          }
          const diamondMMSize = await getIdFromName(
            element[j].product_dia_mm_size,
            mmSizeList,
            "value",
            "product MM Size"
          );

          if (
            diamondMMSize &&
            diamondMMSize.error &&
            diamondMMSize.error !== null
          ) {
            errors.push({
              style_no: productList[index].style_no,
              error_message: diamondMMSize.error,
            });
          }
          // const diamondCaratSize = await getIdFromName(
          //   element[j].product_dia_carat,
          //   caratSizeList,
          //   "value",
          //   "product carat size"
          // );

          // if (diamondCaratSize.error && diamondCaratSize.error !== null) {
          //   errors.push({
          //     style_no: productList[index].style_no,
          //     error_message: diamondCaratSize.error,
          //   });
          // }
          diamondList.push({
            ...element[j],
            product_dia_type: element[j].product_dia_type,
            stone: stone.data,
            product_dia_shape: diamondShape.data,
            product_dia_mm_size:
              diamondMMSize && diamondMMSize.data ? diamondMMSize.data : null,
            product_dia_carat: element[j].product_dia_carat,
            product_dia_color:
              element[j].dia_color_clarity &&
              element[j].dia_color_clarity
                .split(",")
                .map((value: any) => value.split("|")[0]),
            product_dia_clarity:
              element[j].dia_color_clarity &&
              element[j].dia_color_clarity
                .split(",")
                .map((value: any) => value.split("|")[1]),
            dia_cuts: element[j].dia_cuts && element[j].dia_cuts.split("|"),
            diamond_type: element[j].diamond_type,
          });
        }
      }

      if (
        productList[index].product_diamond_details &&
        productList[index].product_diamond_details.length > 0
      ) {
        for (
          let j = 0;
          j < productList[index].product_diamond_details.length;
          j++
        ) {
          const stone = await getIdFromName(
            productList[index].product_diamond_details[j].stone,
            gemstoneList,
            "sort_code",
            "product type"
          );

          if (stone.error && stone.error !== null) {
            errors.push({
              style_no: productList[index].style_no,
              error_message: stone.error,
            });
          }

          const diamondShape = await getIdFromName(
            productList[index].product_diamond_details[j].product_dia_shape,
            diamondShapeList,
            "name",
            "product Diamond Shape"
          );

          if (diamondShape.error && diamondShape.error !== null) {
            errors.push({
              style_no: productList[index].style_no,
              error_message: diamondShape.error,
            });
          }

          // const diamondCaratSize = await getIdFromName(
          //   productList[index].product_diamond_details[j].product_dia_carat,
          //   caratSizeList,
          //   "value",
          //   "product carat size"
          // );

          // if (diamondCaratSize.error && diamondCaratSize.error !== null) {
          //   errors.push({
          //     style_no: productList[index].style_no,
          //     error_message: diamondCaratSize.error,
          //   });
          // }

          stoneList.push({
            ...productList[index].product_diamond_details[j],
            stone: stone.data,
            product_dia_shape: diamondShape.data,
          });
        }
      }

      if (
        productList[index].alternate_stone_diamond_details &&
        productList[index].alternate_stone_diamond_details.length > 0
      ) {
        for (
          let j = 0;
          j < productList[index].alternate_stone_diamond_details.length;
          j++
        ) {
          const stone = await getIdFromName(
            productList[index].alternate_stone_diamond_details[j].stone,
            gemstoneList,
            "sort_code",
            "product type"
          );

          if (stone.error && stone.error !== null) {
            errors.push({
              style_no: productList[index].style_no,
              error_message: stone.error,
            });
          }

          const diamondShape = await getIdFromName(
            productList[index].alternate_stone_diamond_details[j]
              .product_dia_shape,
            diamondShapeList,
            "name",
            "product Diamond Shape"
          );

          if (diamondShape.error && diamondShape.error !== null) {
            errors.push({
              style_no: productList[index].style_no,
              error_message: diamondShape.error,
            });
          }

          alternateStoneList.push({
            ...productList[index].alternate_stone_diamond_details[j],
            stone: stone.data,
            product_dia_shape: diamondShape.data,
          });
        }
      }

      productData.push({
        ...productList[index],
        product_fixed_diamond_details: diamondList,
        product_diamond_details: stoneList,
        alternate_stone_diamond_details: alternateStoneList,
      });
    }

    if (errors && errors.length > 0) {
      return resUnknownError({ data: errors });
    }

    return resSuccess({ data: productData });
  } catch (error) {
    throw error;
  }
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
        for (let i = 0; i < product_metal_details[key].length; i++) {
          if (Object.keys(product_metal_details[key][i]).length > 0) {
            const metal = await getIdFromName(
              product_metal_details[key][i].metal,
              metalMaster,
              "name",
              "Metal"
            );
            if (metal && metal.error && metal.error !== null) {
              errors.push({
                style_no: product.style_no,
                error_message: metal.error,
              });
            }
            if (product_metal_details[key][i].karat) {
              const karat = await getIdFromName(
                product_metal_details[key][i].karat,
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
              product_metal_details[key][i].id_karat = karat.data;
            } else {
              product_metal_details[key][i].id_karat = null;
            }

            product_metal_details[key][i].id_metal = metal?.data;

            productData.push({
              ...product,
              product_metal_data: product_metal_details[key][i],
              product_metal_details: {},
            });
          }
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
const addProductDetailsToProductList = (
  row: any,
  productList: any,
  currentProductIndex: number
) => {
  if (
    row.metal_weight_type &&
    row.metal_weight_type !== "" &&
    row.metal_weight_type !== null
  ) {
    CONFIG_PRODUCT_METAL_DETAILS.forEach((detail) => {
      if (row[detail.key] && row[detail.key] !== "") {
        productList[currentProductIndex].product_metal_details[
          detail.productListField
        ].push({
          metal_weight_type: row.metal_weight_type.toLocaleLowerCase(),
          metal: detail.metal,
          karat: detail.karat,
          metal_tone: row.metal_tone,
          metal_weight: row[detail.key],
          labor_charge: row.labour_charge ? row.labour_charge : null,
        });
      }
    });
  }

  if (
    row.product_dia_type &&
    row.product_dia_type !== "" &&
    row.product_dia_type !== null &&
    row.product_dia_type.toString().toLocaleLowerCase() == "diamond"
  ) {
    BRACELET_CONFIG_PRODUCT_DIAMOND_DETAILS.forEach((detail) => {
      if (row[detail.key] && row[detail.key] !== "") {
        productList[currentProductIndex][detail.productListField].push({
          alternate_stone:
            row.alternate_stone &&
            row.alternate_stone !== null &&
            row.alternate_stone !== ""
              ? row.alternate_stone.toString().toLocaleLowerCase()
              : null,
          product_dia_type: row.product_dia_type.toLocaleLowerCase(),
          stone: row.product_dia_type.toLocaleLowerCase(),
          diamond_type: detail.diamondType,
          product_dia_carat: row.product_dia_carat,
          product_dia_wt: row.product_dia_carat,
          product_dia_shape: row.product_dia_shape,
          product_dia_mm_size: row.product_dia_mm_size,
          dia_color_clarity: row[detail.key],
          dia_cuts: null,
          product_dia_count: row.product_dia_count,
        });
      }
    });
  }
  if (
    row.product_dia_type &&
    row.product_dia_type !== "" &&
    row.product_dia_type !== null &&
    row.product_dia_type.toString().toLocaleLowerCase() == "gemstone" &&
    row.alternate_stone
  ) {
    CONFIG_PRODUCT_GEMSTONE_DETAILS.forEach((detail) => {
      if (row[detail.key] && row[detail.key] !== "") {
        productList[currentProductIndex][detail.alternateStoneListField].push({
          alternate_stone:
            row.alternate_stone &&
            row.alternate_stone !== "" &&
            row.alternate_stone !== null
              ? row.alternate_stone.toString().toLocaleLowerCase()
              : null,
          product_dia_type: row.product_dia_type,
          stone: detail.stone,
          diamond_type: detail.diamondType,
          product_dia_carat: row.product_dia_carat,
          product_dia_wt: row.product_dia_carat,
          product_dia_shape: row.product_dia_shape,
          dia_mm_size: row.dia_mm_size,
          dia_color_clarity: null,
          dia_cuts: row[detail.key] && row[detail.key].split("|"),
          product_dia_count: row.product_dia_count,
        });
      }
    });
  } else if (
    row.product_dia_type &&
    row.product_dia_type !== "" &&
    row.product_dia_type !== null &&
    row.product_dia_type.toString().toLocaleLowerCase() == "gemstone" &&
    (!row.alternate_stone ||
      row.alternate_stone === "" ||
      row.alternate_stone == null)
  ) {
    CONFIG_PRODUCT_GEMSTONE_DETAILS.forEach((detail) => {
      if (row[detail.key] && row[detail.key] !== "") {
        productList[currentProductIndex].product_dia_type = detail.diamondType;
        productList[currentProductIndex][detail.productListField].push({
          alternate_stone:
            row.alternate_stone &&
            row.alternate_stone !== "" &&
            row.alternate_stone !== null
              ? row.alternate_stone.toString().toLocaleLowerCase()
              : null,
          product_dia_type: row.product_dia_type,
          stone: detail.stone,
          diamond_type: detail.diamondType,
          product_dia_carat: row.product_dia_carat,
          product_dia_wt: row.product_dia_carat,
          product_dia_shape: row.product_dia_shape,
          dia_mm_size: row.dia_mm_size,
          dia_color_clarity: null,
          dia_cuts: row[detail.key] && row[detail.key].split("|"),
          product_dia_count: row.product_dia_count,
        });
      }
    });
  }
};

const addProductToDB = async (productList: any, idAppUser: number,client_id:number, req: Request) => {
  const trn = await req.body.db_connection.transaction();
  let resProduct,
    prodMetalPayload: any = [],
    productDiamondPayload: any = [];
  let activitylogs: any = {}
  let products = [];
  const {SideSettingStyles,StoneData,DiamondShape,DiamondCaratSize,Colors,ClarityData,CutsData,LengthData,ConfigBraceletProduct,ConfigBraceletProductMetals,ConfigBraceletProductDiamonds} = initModels(req);
  const where = {
    is_active: ActiveStatus.Active,
    is_deleted: DeletedStatus.No,
    company_info_id: client_id 
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
      const caratSortCode = await getPipedShortCodeFromField(
        caratMaster,
        product.dia_display_wt,
        "id",
        "sort_code"
      );
      const caratValue = await getPipedShortCodeFromField(
        caratMaster,
        product.dia_display_wt,
        "id",
        "value"
      );
      const settingName = await getPipedShortCodeFromField(
        sideSetting,
        product.setting_type,
        "id",
        "name"
      );
      const productLength = await getPipedShortCodeFromField(
        productLengthMaster,
        product.product_length,
        "id",
        "length"
      );

      let skuDiamondDetail: any = {
        product_dia_type: "",
        stone: "",
        stone_name: "",
        dia_shape_name: "",
        dia_shape: "",
        dia_color: "",
        dia_clarity: "",
        dia_cuts: "",
        diamond_carat: "",
        diamond_carat_value: "",
      };

      if (
        product.product_diamond_details.length == 0 &&
        product.alternate_stone_diamond_details.length == 0 &&
        product.product_fixed_diamond_details.length > 0
      ) {
        skuDiamondDetail = {
          product_dia_type:
            product.product_fixed_diamond_details[0].diamond_type,
          stone: await getPipedShortCodeFromField(
            stone,
            product.product_fixed_diamond_details[0].stone,
            "id",
            "sort_code"
          ),
          stone_name: await getPipedShortCodeFromField(
            stone,
            product.product_fixed_diamond_details[0].stone,
            "id",
            "name"
          ),
          dia_shape_name: await getPipedShortCodeFromField(
            shape,
            product.product_fixed_diamond_details[0].product_dia_shape,
            "id",
            "name"
          ),
          dia_shape: await getPipedShortCodeFromField(
            shape,
            product.product_fixed_diamond_details[0].product_dia_shape,
            "id",
            "sort_code"
          ),
          dia_color: await getPipedShortCodeFromField(
            colorMaster,
            product.product_fixed_diamond_details[0].product_dia_color,
            "id",
            "name"
          ),
          dia_clarity: await getPipedShortCodeFromField(
            clarityMaster,
            product.product_fixed_diamond_details[0].product_dia_clarity,
            "id",
            "value"
          ),
          dia_cuts: "",
          diamond_carat: caratSortCode,
          diamond_carat_value: caratValue,
        };
      } else if (
        product.product_diamond_details.length > 0 &&
        product.alternate_stone_diamond_details.length == 0 &&
        product.product_fixed_diamond_details.length > 0
      ) {
        skuDiamondDetail = {
          product_dia_type: product.product_diamond_details[0].diamond_type,
          stone: `${await getPipedShortCodeFromField(
            stone,
            product.product_diamond_details[0].stone,
            "id",
            "name"
          )}-ALT-${await getPipedShortCodeFromField(
            stone,
            product.product_diamond_details[1].stone,
            "id",
            "name"
          )}`,
          stone_name: await getPipedShortCodeFromField(
            stone,
            product.product_diamond_details[0].stone,
            "id",
            "name"
          ),
          dia_shape: await getPipedShortCodeFromField(
            shape,
            product.product_diamond_details[0].product_dia_shape,
            "id",
            "sort_code"
          ),
          dia_shape_name: await getPipedShortCodeFromField(
            shape,
            product.product_diamond_details[0].product_dia_shape,
            "id",
            "name"
          ),
          dia_color: await getPipedShortCodeFromField(
            colorMaster,
            product.product_diamond_details[0].product_dia_color,
            "id",
            "name"
          ),
          dia_clarity: await getPipedShortCodeFromField(
            clarityMaster,
            product.product_diamond_details[0].product_dia_clarity,
            "id",
            "value"
          ),
          dia_cuts: await getPipedShortCodeFromField(
            cutMaster,
            product.product_diamond_details[1].dia_cuts,
            "id",
            "value"
          ),
          diamond_carat: caratSortCode,
          diamond_carat_value: caratValue,
        };
      } else if (
        product.product_diamond_details.length > 0 &&
        product.alternate_stone_diamond_details.length > 0 &&
        product.product_fixed_diamond_details.length == 0
      ) {
        skuDiamondDetail = {
          product_dia_type: product.product_diamond_details[0].diamond_type,
          stone: `${await getPipedShortCodeFromField(
            stone,
            product.product_diamond_details[0].stone,
            "id",
            "name"
          )}-ALT-${await getPipedShortCodeFromField(
            stone,
            product.product_diamond_details[1].stone,
            "id",
            "name"
          )}`,
          stone_name: await getPipedShortCodeFromField(
            stone,
            product.product_diamond_details[0].stone,
            "id",
            "name"
          ),
          dia_shape: await getPipedShortCodeFromField(
            shape,
            product.product_diamond_details[0].product_dia_shape,
            "id",
            "sort_code"
          ),
          dia_shape_name: await getPipedShortCodeFromField(
            shape,
            product.product_diamond_details[0].product_dia_shape,
            "id",
            "name"
          ),
          dia_color: await getPipedShortCodeFromField(
            colorMaster,
            product.product_diamond_details[0].product_dia_color,
            "id",
            "name"
          ),
          dia_clarity: await getPipedShortCodeFromField(
            clarityMaster,
            product.product_diamond_details[0].product_dia_clarity,
            "id",
            "value"
          ),
          dia_cuts: await getPipedShortCodeFromField(
            cutMaster,
            product.product_diamond_details[0].dia_cuts,
            "id",
            "value"
          ),
          diamond_carat: caratSortCode,
          diamond_carat_value: caratValue,
        };
      }
      const sku = await `${
        DIAMOND_TYPE.natural === skuDiamondDetail.product_dia_type
          ? "NATURAL"
          : "LAB_GROWN"
      }-${setting}-${skuDiamondDetail.stone}-${
        skuDiamondDetail.diamond_carat
      }-${skuDiamondDetail.dia_shape}${
        skuDiamondDetail.dia_color ? `-${skuDiamondDetail.dia_color}` : ``
      }${
        skuDiamondDetail.dia_clarity ? `-${skuDiamondDetail.dia_clarity}` : ``
      }${
        skuDiamondDetail.dia_cuts
          ? `-${skuDiamondDetail.dia_cuts.toUpperCase()}`
          : ``
      }-${product.product_metal_data.metal}${
        product.product_metal_data.karat
          ? `-${product.product_metal_data.karat}KT`
          : ""
      }-${productLength}-${
        product.product_metal_data.metal_weight_type.toLocaleLowerCase() ==
        "light weight"
          ? "LW"
          : "Hw"
      }-${product.product_style.toUpperCase().replaceAll(" ", "-")}
`;

      const product_name: any = `${
        product.product_metal_data.karat
          ? `${product.product_metal_data.karat}KT`
          : ""
      } ${product.product_metal_data.metal} ${
        DIAMOND_TYPE.natural === skuDiamondDetail.product_dia_type
          ? "NATURAL"
          : "LAB_GROWN"
      } ${settingName} ${skuDiamondDetail.stone_name} ${
        skuDiamondDetail.diamond_carat
      } carat ${skuDiamondDetail.dia_shape_name} ${
        skuDiamondDetail.dia_color ? ` ${skuDiamondDetail.dia_color} color` : ``
      }${
        skuDiamondDetail.dia_clarity
          ? ` ${skuDiamondDetail.dia_clarity} clarity`
          : ``
      }${
        skuDiamondDetail.dia_cuts
          ? ` ${skuDiamondDetail.dia_cuts.toUpperCase()} cut`
          : ``
      } ${productLength} length ${
        product.product_metal_data.metal_weight_type
      } ${product.product_style}`;

      let slug = product_name
        .toLocaleLowerCase()
        .toString()
        .replaceAll(" ", "-")
        .replaceAll(/['/|]/g, "-");

      const sameSlugCount = await ConfigBraceletProduct.count({
        where: [
          columnValueLowerCase("slug", slug),
          { is_deleted: DeletedStatus.No,company_info_id: client_id  },
        ],
        transaction: trn,
      });
      const sameSKU = await ConfigBraceletProduct.count({
        where: [
          columnValueLowerCase("sku", sku),
          { is_deleted: DeletedStatus.No,company_info_id: client_id  },
        ],
        transaction: trn,
      });
      if (sameSlugCount > 0) {
        slug = `${slug}-${sameSlugCount}`;
      }

      if (sameSKU == 0) {
        resProduct = await ConfigBraceletProduct.create(
          {
            product_type: product.product_type,
            product_style: product.product_style.toLocaleLowerCase(),
            product_length: product.product_length,
            setting_type: product.setting_type,
            hook_type: product.hook_type,
            dia_total_wt: product.dia_display_wt,
            style_no: product.style_no,
            metal_weight_type:
              product.product_metal_data.metal_weight_type.toLocaleLowerCase(),
            slug: slug,
            bracelet_no: product.bracelet_no,
            product_title: product_name,
            sku: sku,
            product_dia_type: skuDiamondDetail.product_dia_type,
            product_sort_des: product_name,
            product_long_des: `<p>${product_name}</p>`,
            created_by: idAppUser,
            is_active: ActiveStatus.Active,
            is_deleted: DeletedStatus.No,
            dia_type: product.diamond_type,
            created_date: getLocalDate(),
            company_info_id: client_id,
          },
          { transaction: trn }
        );
        activitylogs = { ...resProduct?.dataValues}
        prodMetalPayload.push({
          config_product_id: resProduct.dataValues.id,
          id_metal: product.product_metal_data.id_metal,
          id_karat: product.product_metal_data.id_karat,
          labour_charge: product.labor_charge
            ? parseFloat(product.labor_charge)
            : 0,
          metal_wt: product.product_metal_data.metal_weight,
          created_date: getLocalDate(),
          created_by: idAppUser,
          company_info_id: client_id,
        });

        if (
          product.product_fixed_diamond_details.length > 0 &&
          product.product_diamond_details.length == 0 &&
          product.alternate_stone_diamond_details.length == 0
        ) {
          for (const diamondValue of product.product_fixed_diamond_details) {
            productDiamondPayload.push({
              config_product_id: resProduct.dataValues.id,
              stone_type: diamondValue.product_dia_type,
              id_stone: diamondValue.stone,
              alternate_stone: diamondValue.alternate_stone,
              id_shape: diamondValue.product_dia_shape,
              id_mm_size: diamondValue.product_dia_mm_size,
              id_color: diamondValue.product_dia_color,
              id_clarity: diamondValue.product_dia_clarity,
              id_cut: diamondValue.dia_cuts,
              id_carat: diamondValue.id_carat,
              dia_wt: diamondValue.product_dia_wt,
              dia_count: diamondValue.product_dia_count,
              id_diamond_group_master: diamondValue.dia_group,
              is_deleted: DeletedStatus.No,
              created_date: getLocalDate(),
              created_by: idAppUser,
              company_info_id: client_id,
            });
          }
        } else {
          for (const diamondValue of product.product_diamond_details) {
            productDiamondPayload.push({
              config_product_id: resProduct.dataValues.id,
              stone_type: diamondValue.product_dia_type,
              id_stone: diamondValue.stone,
              id_shape: diamondValue.product_dia_shape,
              id_mm_size: diamondValue.product_dia_mm_size,
              alternate_stone: diamondValue.alternate_stone,
              id_color: diamondValue.product_dia_color,
              id_clarity: diamondValue.product_dia_clarity,
              id_cut: diamondValue.dia_cuts,
              id_carat: diamondValue.id_carat,
              dia_wt: diamondValue.product_dia_wt,
              dia_count: diamondValue.product_dia_count,
              id_diamond_group_master: diamondValue.dia_group,
              is_deleted: DeletedStatus.No,
              created_date: getLocalDate(),
              created_by: idAppUser,
              company_info_id: client_id,
            });
          }
        }
      }
    }

    const ConfigProductDiamondsData = await ConfigBraceletProductDiamonds.bulkCreate(productDiamondPayload, {
      transaction: trn,
    });
    const ConfigProductMetalsData = await ConfigBraceletProductMetals.bulkCreate(prodMetalPayload, {
      transaction: trn,
    });

    activitylogs = {...activitylogs,Metal:ConfigProductMetalsData.map((t)=>t.dataValues),diamonds:ConfigProductDiamondsData.map((t)=>t.dataValues)}
    await addActivityLogs(req,client_id,[{
      old_data: null,
      new_data: activitylogs}], resProduct?.dataValues?.id, LogsActivityType.Add, LogsType.ConfigBraceletProductBulkUpload, idAppUser,trn)
   
    await trn.commit();
    // await refreshMaterializedBraceletConfiguratorPriceFindView;
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

/* -------------------- Bracelet configurator API's ---------------- */

export const getBraceletConfiguratorProductList = async (req: Request) => {
  try {
    const { ConfigBraceletProduct,ConfigBraceletProductMetals, ConfigBraceletProductDiamonds,SideSettingStyles, MetalMaster, GoldKarat } = initModels(req);
    let paginationProps = {};
    let pagination = {
      ...getInitialPaginationFromQuery(req.query),
      search_text: req.query.search_text,
    };
    let noPagination = req.query.no_pagination === "1";

    let where = [
      { is_deleted: DeletedStatus.No },
      {company_info_id :req?.body?.session_res?.client_id},
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
      const totalItems = await ConfigBraceletProduct.count({
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

    const result = await ConfigBraceletProduct.findAll({
      ...paginationProps,
      where,
      order: [
        pagination.sort_by === "side_setting_name"
          ? ["side_setting", "name", pagination.order_by]
          : [pagination.sort_by, pagination.order_by],
      ],
      attributes: [
        "id",
        "product_type",
        "product_title",
        "product_style",
        "product_length",
        "setting_type",
        "hook_type",
        "dia_total_wt",
        "style_no",
        "bracelet_no",
        "is_active",
        "product_title",
        "sku",
        "slug",
        "product_sort_des",
        "product_long_des",
        "product_dia_type",
        "metal_weight_type",
      ],
      include: [
        {
          required: false,
          model: SideSettingStyles,
          as: "side_setting",
          attributes: ["id", "name", "slug", "sort_code"],
          where:{company_info_id :req?.body?.session_res?.client_id},
        }

      ],
    });

    return resSuccess({ data: { pagination, productList: result } });
  } catch (error) {
    throw error;
  }
};

export const getBraceletConfiguratorProductDetail = async (req: Request) => {
  try {
    const { ConfigBraceletProduct, LengthData, MetalMaster, GoldKarat, SideSettingStyles, ConfigBraceletProductMetals,
      ConfigBraceletProductDiamonds, HookTypeData, DiamondGroupMaster, DiamondShape, Colors, ClarityData, CutsData, DiamondCaratSize,
      StoneData,MMSizeData
    } = initModels(req);
    const result = await ConfigBraceletProduct.findOne({
      where: {
        id: req.params.id,
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
        company_info_id :req?.body?.session_res?.client_id
      },
      attributes: [
        "id",
        "product_type",
        "product_title",
        "product_style",
        "product_length",
        "setting_type",
        "hook_type",
        "dia_total_wt",
        "style_no",
        "bracelet_no",
        "is_active",
        "product_title",
        "sku",
        "slug",
        "product_sort_des",
        "product_long_des",
        "product_dia_type",
        "metal_weight_type",
        [Sequelize.literal("side_setting.name"), "side_setting_name"],
        [Sequelize.literal("length.length"), "length_value"],
        [Sequelize.literal("hook.name"), "hook_value"],
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
          model: LengthData,
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
          as: "length",
        },
        {
          required: false,
          model: HookTypeData,
          attributes: [],
          where:{company_info_id :req?.body?.session_res?.client_id},
          as: "hook",
        },
        {
          required: false,
          model: ConfigBraceletProductDiamonds,
          attributes: [
            "id",
            "config_product_id",
            "stone_type",
            "id_stone",
            "id_shape",
            "id_mm_size",
            "id_color",
            "id_clarity",
            "id_cut",
            "id_carat",
            "dia_wt",
            "dia_count",
            "id_diamond_group_master",
            "alternate_stone",
            [
              Sequelize.literal(
                `"config_product_diamond_details->shape"."name"`
              ),
              "diamond_shape_name",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->cuts"."value"`
              ),
              "diamond_cut_value",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->clarity"."value"`
              ),
              "diamond_clarity_value",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->color"."name"`
              ),
              "diamond_color_name",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->stone"."name"`
              ),
              "stone_name",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->stone"."sort_code"`
              ),
              "stone_sort_code",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->carat"."value"`
              ),
              "diamond_carat_size",
            ],
            [
              Sequelize.literal(
                `CASE WHEN "config_bracelet_products"."product_dia_type" = 2 THEN  "config_product_diamond_details->diamond_group_master"."synthetic_rate" ELSE "config_product_diamond_details->diamond_group_master"."rate" END`
              ),
              "diamond_price",
            ],
            [
              Sequelize.literal(
                `CASE WHEN "config_bracelet_products"."product_dia_type" = 2 THEN  "config_product_diamond_details->diamond_group_master"."synthetic_rate"*"config_product_diamond_details"."dia_wt"*"config_product_diamond_details"."dia_count" ELSE "config_product_diamond_details->diamond_group_master"."rate"*"config_product_diamond_details"."dia_wt"*"config_product_diamond_details"."dia_count" END`
              ),
              "total_diamond_price",
            ],
          ],
          include: [
            {
              required: false,
              model: DiamondGroupMaster,
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
              as: "diamond_group_master",
            },
            {
              required: false,
              model: DiamondShape,
              as: "shape",
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
            },
            {
              required: false,
              model: Colors,
              as: "color",
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
            },
            {
              required: false,
              model: ClarityData,
              as: "clarity",
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
            },
            {
              required: false,
              model: CutsData,
              as: "cuts",
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
            },
            {
              required: false,
              model: StoneData,
              as: "stone",
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
            },
            {
              required: false,
              model: DiamondCaratSize,
              as: "carat",
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
            },
            {
              required: false,
              model: MMSizeData,
              as: "mm_size",
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
            },
          ],
          as: "config_product_diamond_details",
          where: { is_deleted: DeletedStatus.No,company_info_id :req?.body?.session_res?.client_id },
        },
        {
          required: false,
          model: ConfigBraceletProductMetals,
          where:{company_info_id :req?.body?.session_res?.client_id},
          attributes: [
            "id",
            "config_product_id",
            "id_metal",
            "id_karat",
            "labour_charge",
            "metal_wt",
            [
              Sequelize.literal(
                `"config_product_metal_details->metal_detail"."name"`
              ),
              "metal_name",
            ],
            [
              Sequelize.literal(
                `"config_product_metal_details->karat_detail"."name"`
              ),
              "karat_value",
            ],
            [
              Sequelize.literal(
                `CASE WHEN "config_product_metal_details"."id_karat" IS NULL THEN "config_product_metal_details->metal_detail"."metal_rate"*"config_product_metal_details"."metal_wt" 
                ELSE (("config_product_metal_details->metal_detail"."metal_rate" / "config_product_metal_details->metal_detail"."calculate_rate") * "config_product_metal_details->karat_detail"."calculate_rate" )*"config_product_metal_details"."metal_wt" 
                END`
              ),
              "metal_price",
            ]
          ],

          as: "config_product_metal_details",
          include: [
            {
              required: false,
              model: MetalMaster,
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
              as: "metal_detail",
            },
            {
              required: false,
              model: GoldKarat,
              attributes: [],
              where:{company_info_id :req?.body?.session_res?.client_id},
              as: "karat_detail",
            },
          ],
        },
      ],
    });

    if (!(result && result.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(DATA_NOT_FOUND, [
          ["field_name", "Product"],
        ]),
      });
    }

    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const getBraceletConfiguratorProductDetailForUser = async (
  req: Request
) => {
  try {
    const {ConfigBraceletProduct,SideSettingStyles,LengthData,HookTypeData,ConfigBraceletProductDiamonds,DiamondGroupMaster,
       DiamondCaratSize, DiamondShape, Colors, ClarityData, CutsData,StoneData,MMSizeData,ConfigBraceletProductMetals,MetalMaster, GoldKarat} = initModels(req);
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const result = await ConfigBraceletProduct.findOne({
      where: {
        slug: { [Op.iLike]: `%${req.params.slug}%` },
        is_deleted: DeletedStatus.No,
        is_active: ActiveStatus.Active,
        company_info_id: company_info_id?.data
      },
      attributes: [
        "id",
        "product_type",
        "product_title",
        "product_style",
        "product_length",
        "setting_type",
        "hook_type",
        "dia_total_wt",
        "style_no",
        "bracelet_no",
        "product_title",
        "sku",
        "slug",
        "product_sort_des",
        "product_long_des",
        "product_dia_type",
        "metal_weight_type",
      ],
      include: [
        {
          required: false,
          model: SideSettingStyles,
          as: "side_setting",
          attributes: ["name"],
          where:{company_info_id: company_info_id?.data},
        },
        {
          required: false,
          model: LengthData,
          attributes: ["length"],
          as: "length",
          where:{company_info_id: company_info_id?.data},
        },
        {
          required: false,
          model: HookTypeData,
          attributes: ["name"],
          as: "hook",
          where:{company_info_id: company_info_id?.data},
        },
        {
          required: false,
          model: ConfigBraceletProductDiamonds,
          attributes: [
            "id",
            "config_product_id",
            "stone_type",
            "id_stone",
            "id_shape",
            "id_mm_size",
            "id_color",
            "id_clarity",
            "id_cut",
            "id_carat",
            "dia_wt",
            "dia_count",
            "id_diamond_group_master",
            [
              Sequelize.literal(
                `"config_product_diamond_details->shape"."name"`
              ),
              "diamond_shape_name",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->cuts"."value"`
              ),
              "diamond_cut_value",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->clarity"."value"`
              ),
              "diamond_clarity_value",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->color"."name"`
              ),
              "diamond_color_name",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->stone"."name"`
              ),
              "stone_name",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->stone"."sort_code"`
              ),
              "stone_sort_code",
            ],
            [
              Sequelize.literal(
                `"config_product_diamond_details->carat"."value"`
              ),
              "diamond_carat_size",
            ],
            [
              Sequelize.literal(
                `CASE WHEN "config_bracelet_products"."product_dia_type" = 2 THEN  "config_product_diamond_details->diamond_group_master"."synthetic_rate" ELSE "config_product_diamond_details->diamond_group_master"."rate" END`
              ),
              "diamond_price",
            ],
          ],
          as: "config_product_diamond_details",
          where: { is_deleted: DeletedStatus.No,company_info_id: company_info_id?.data },
          include: [
            {
              required: false,
              model: DiamondGroupMaster,
              attributes: [],
              where:{company_info_id: company_info_id?.data},
              as: "diamond_group_master",
            },
            {
              required: false,
              model: DiamondShape,
              as: "shape",
              attributes: [],
              where:{company_info_id: company_info_id?.data},
            },
            {
              required: false,
              model: Colors,
              as: "color",
              attributes: [],
              where:{company_info_id: company_info_id?.data},
            },
            {
              required: false,
              model: ClarityData,
              as: "clarity",
              attributes: [],
              where:{company_info_id: company_info_id?.data},
            },
            {
              required: false,
              model: CutsData,
              as: "cuts",
              attributes: [],
              where:{company_info_id: company_info_id?.data},
            },
            {
              required: false,
              model: StoneData,
              as: "stone",
              attributes: [],
              where:{company_info_id: company_info_id?.data},
            },
            {
              required: false,
              model: DiamondCaratSize,
              as: "carat",
              attributes: [],
              where:{company_info_id: company_info_id?.data},
            },
            {
              required: false,
              model: MMSizeData,
              as: "mm_size",
              attributes: [],
              where:{company_info_id: company_info_id?.data},
            },
          ],
        },
        {
          required: false,
          model: ConfigBraceletProductMetals,
          attributes: [
            "id",
            "config_product_id",
            "id_metal",
            "id_karat",
            "labour_charge",
            "metal_wt",
            [
              Sequelize.literal(
                `"config_product_metal_details->metal_detail"."name"`
              ),
              "metal_name",
            ],
            [
              Sequelize.literal(
                `"config_product_metal_details->karat_detail"."name"`
              ),
              "karat_value",
            ],
          ],

          as: "config_product_metal_details",
          where:{company_info_id: company_info_id?.data},
          include: [
            {
              required: false,
              model: MetalMaster,
              attributes: [],
              where:{company_info_id: company_info_id?.data},
              as: "metal_detail",
            },
            {
              required: false,
              model: GoldKarat,
              attributes: [],
              where:{company_info_id: company_info_id?.data},
              as: "karat_detail",
            },
          ],
        },
      ],
    });

    if (!(result && result.dataValues)) {
      return resNotFound({
        message: prepareMessageFromParams(DATA_NOT_FOUND, [
          ["field_name", "Product"],
        ]),
      });
    }
    return resSuccess({ data: result });
  } catch (error) {
    throw error;
  }
};

export const deleteBraceletConfiguratorProduct = async (req: Request) => {
  try {

    const { ConfigBraceletProduct, ConfigBraceletProductMetals, ConfigBraceletProductDiamonds,ProductWish,CartProducts } = initModels(req);
    const product = await ConfigBraceletProduct.findOne({
      where: {
        id: req.params.id,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
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
      await ConfigBraceletProduct.update(
        { is_deleted: DeletedStatus.yes },
        { where: { id: req.params.id,company_info_id :req?.body?.session_res?.client_id } }
      );

      await ConfigBraceletProductDiamonds.update(
        { is_deleted: DeletedStatus.yes },
        { where: { config_product_id: req.params.id,company_info_id :req?.body?.session_res?.client_id } }
      );

      await ConfigBraceletProductMetals.update(
        { is_deleted: DeletedStatus.yes },
        { where: { config_product_id: req.params.id,company_info_id :req?.body?.session_res?.client_id } }
      );
      const findProductWish = await ProductWish.findAll({
        where: {
          product_id: req.params.id,
          product_type: [AllProductTypes.BraceletConfigurator],
        }, transaction: trn,
      });
      await ProductWish.destroy({
        where: {
          product_id: req.params.id,
          product_type: [AllProductTypes.BraceletConfigurator],
          company_info_id :req?.body?.session_res?.client_id,
        },
        transaction: trn,
      });
      const findCartProducts = await CartProducts.findAll({
        where: {
          product_id: req.params.id,
          product_type: [AllProductTypes.BraceletConfigurator],
        },
      });  
      await CartProducts.destroy({
        where: {
          product_id: req.params.id,
          product_type: [AllProductTypes.BraceletConfigurator],
          company_info_id :req?.body?.session_res?.client_id,
        },
        transaction: trn,
      });
      await addActivityLogs(req,req?.body?.session_res?.client_id,[{
        old_data: { config_bracelet_product_id: product?.dataValues?.id, data:{...product?.dataValues},findProductWishdata: findProductWish.map((t: any) => t.dataValues),
        findCartProducts: findCartProducts.map((t: any) => t.dataValues)},
        new_data: {
          config_bracelet_product_id: product?.dataValues?.id, data: {
            ...product?.dataValues, is_deleted: DeletedStatus.yes,
            modified_by: req?.body?.session_res?.id_app_user,
            modified_date: getLocalDate(),
          },findProductWishdata: null,
          findCartProducts: null
        }
      }], product?.dataValues?.id, LogsActivityType.Delete, LogsType.ConfigBraceletProductBulkUpload, req?.body?.session_res?.id_app_user,trn)
      await trn.commit();
      await refreshMaterializedBraceletConfiguratorPriceFindView;
      return resSuccess({ message: RECORD_DELETE_SUCCESSFULLY });
    } catch (error) {
      await trn.rollback();
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

/* bracelet product price find without using materialized view */

export const braceletConfiguratorProductPriceFindWithUsingMaterializedView = async (req: any) => {
  try {
    const {
      product_style,
      product_length,
      dia_weight,
      metal_weight_type,
      diamond_type,
      setting_style,
      hook,
      id_metal,
      id_karat,
      id_stone,
      id_shape,
      id_color,
      id_clarity,
      id_cut,
      alternate_id_stone,
      alternate_id_shape,
      alternate_id_color,
      alternate_id_clarity,
      alternate_id_cut,
      stone_combination_type = "",
    } = req.body;
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const result: any = await req.body.db_connection.query(
      `(SELECT 
      id,
      product_type,
      product_style,
      product_length,
      setting_type,
      hook_type,
      dia_total_wt,
      style_no,
      bracelet_no,
      product_title,
      sku,
      slug,
      product_sort_des,
      product_long_des,
      id_metal,
      id_karat,
      product_dia_type,
      metal_weight_type,
      total_diamond_wt,
      product_price,
      metals,
      diamond_details
FROM bracelet_configurator_price_view
WHERE 
product_style = '${product_style}'
AND company_info_id = ${company_info_id?.data}
AND product_length = ${product_length}
AND dia_total_wt =  ${dia_weight}
AND setting_type = ${setting_style}
AND hook_type = ${hook}
AND product_dia_type = ${diamond_type}
AND id_metal = ${id_metal}
AND id_karat ${id_karat && id_karat != null ? `= ${id_karat}` : `IS NULL`}
AND stone_combination_type = ${
        stone_combination_type == "gemstone-gemstone"
          ? `'gemstone'`
          : `'${stone_combination_type}'`
      }
AND metal_weight_type = '${metal_weight_type}'
AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(diamond_details) AS elem
    WHERE CAST(elem->>'id_stone' as INTEGER) = ${id_stone} 
	AND CAST(elem->>'id_shape' as INTEGER) = ${id_shape}
	AND CAST(elem->>'id_color' as INTEGER) ${
    id_color && id_color != null ? `= ${id_color}` : `IS NULL`
  }
	AND CAST(elem->>'id_clarity' as INTEGER) ${
    id_clarity && id_clarity != null ? `= ${id_clarity}` : `IS NULL`
  }
	AND CAST(elem->>'id_cut' as INTEGER) ${
    id_cut && id_cut != null ? `= ${id_cut}` : `IS NULL`
  }
  AND elem->>'alternate_stone' IS NULL
) AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(diamond_details) AS elem
    WHERE CAST(elem->>'id_stone' as INTEGER) = ${
      alternate_id_stone && alternate_id_stone != null
        ? `${alternate_id_stone}`
        : `${id_stone}`
    }  
	AND CAST(elem->>'id_shape' as INTEGER) = ${
    alternate_id_shape && alternate_id_shape != null
      ? `${alternate_id_shape}`
      : `${id_shape}`
  }
	AND CAST(elem->>'id_color' as INTEGER)  ${
    alternate_id_color && alternate_id_color != null
      ? `${
          alternate_id_color && alternate_id_color != null
            ? ` = ${alternate_id_color}`
            : `IS NULL`
        }`
      : stone_combination_type == "diamond-gemstone"
      ? `${
          alternate_id_color && alternate_id_color != null
            ? ` = ${alternate_id_color}`
            : `IS NULL`
        }`
      : `${id_color && id_color != null ? ` = ${id_color}` : `IS NULL`}`
  }
  AND CAST(elem->>'id_clarity' as INTEGER) ${
    alternate_id_clarity && alternate_id_clarity != null
      ? `${
          alternate_id_clarity && alternate_id_clarity != null
            ? ` = ${alternate_id_clarity}`
            : `IS NULL`
        }`
      : stone_combination_type == "diamond-gemstone"
      ? `${
          alternate_id_clarity && alternate_id_clarity != null
            ? ` = ${alternate_id_clarity}`
            : `IS NULL`
        }`
      : `${id_clarity && id_clarity != null ? ` = ${id_clarity}` : `IS NULL`}`
  }
  AND CAST(elem->>'id_cut' as INTEGER) ${
    alternate_id_cut &&
    alternate_id_cut != null &&
    stone_combination_type == "diamond-gemstone"
      ? `${
          alternate_id_cut && alternate_id_cut != null
            ? ` = ${alternate_id_cut}`
            : `IS NULL`
        }`
      : `${id_cut && id_cut != null ? ` = ${id_cut}` : `IS NULL`}`
  }
	${
    stone_combination_type == "gemstone-gemstone" ||
    stone_combination_type == "gemstone"
      ? "AND elem->>'alternate_stone' = 'true'"
      : ""
  }
))
`,
      { type: QueryTypes.SELECT }
    );

    const product = {
      ...result[0],
      product_price: await req.formatPrice(result[0].product_price, PRICE_CORRECTION_PRODUCT_TYPE.BracelateConfigurator),
    };
    return resSuccess({ data: product });
  } catch (error) {
    throw error;
  }
};

/* bracelet product price find without using materialized view */

export const braceletConfiguratorProductPriceFindWithoutUsingMaterializedView = async (req: any) => {
  try {
    const {
      product_style,
      product_length,
      dia_weight,
      metal_weight_type,
      diamond_type,
      setting_style,
      hook,
      id_metal,
      id_karat,
      id_stone,
      id_shape,
      id_color,
      id_clarity,
      id_cut,
      alternate_id_stone,
      alternate_id_shape,
      alternate_id_color,
      alternate_id_clarity,
      alternate_id_cut,
      stone_combination_type = "",
    } = req.body;
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    
   let result:any
    if(id_stone != null && id_color != null && id_clarity != null && alternate_id_stone != null && alternate_id_color != null && alternate_id_clarity != null && id_stone == alternate_id_stone){
      result = await req.body.db_connection.query(
        `SELECT 
    cbp.id,
    cbp.product_type,
    cbp.product_style,
    cbp.product_length,
    cbp.setting_type,
    cbp.hook_type,
    cbp.dia_total_wt,
    cbp.style_no,
    cbp.bracelet_no,
    cbp.product_title,
    cbp.sku,
    cbp.slug,
    cbp.product_sort_des,
    cbp.product_long_des,
    cbpm.id_metal,
    cbpm.id_karat,
    cbp.product_dia_type,
    cbp.metal_weight_type,
    cs.value AS total_diamond_wt,
	CASE WHEN cbpm.id_karat IS NULL THEN metal_masters.metal_rate * cbpm.metal_wt
									 	+ COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN DDGM.rate ELSE DDGM.synthetic_rate END) 
										* (CASE WHEN dstone.is_diamond = 1 THEN cbpd_dia.dia_wt ELSE 1 END) * cbpd_dia.dia_count),0)
										
	ELSE (metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.calculate_rate::double precision)  * cbpm.metal_wt
                    + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN DDGM.rate ELSE DDGM.synthetic_rate END) 
										* (CASE WHEN dstone.is_diamond = 1 THEN cbpd_dia.dia_wt ELSE 1 END) * cbpd_dia.dia_count),0)         
										
	END as product_price,
    json_build_object('id', cbpm.id, 'config_product_id', cbpm.config_product_id, 'id_metal', cbpm.id_metal, 'id_karat', cbpm.id_karat, 'metal_name', metal_masters.name, 'karat_value', gold_kts.name, 'labour_charge', cbpm.labour_charge, 'metal_wt', cbpm.metal_wt) AS metals
FROM config_bracelet_products cbp

LEFT JOIN carat_sizes cs ON cs.id::double precision = cbp.dia_total_wt
JOIN config_bracelet_product_metals cbpm ON cbpm.config_product_id = cbp.id

-- Diamond condition
LEFT JOIN config_bracelet_product_diamonds cbpd_dia 
    ON cbpd_dia.config_product_id = cbp.id 
    AND cbpd_dia.id_stone = ${id_stone} 
    AND cbpd_dia.id_shape = ${id_shape} 
    AND cbpd_dia.id_color = ${id_color} 
    AND cbpd_dia.id_clarity = ${id_clarity} 
    AND cbpd_dia.id_cut IS NULL
LEFT JOIN diamond_group_masters DDGM ON DDGM.id = cbpd_dia.id_diamond_group_master
LEFT JOIN gemstones dstone ON dstone.id = cbpd_dia.id_stone
LEFT JOIN metal_masters ON cbpm.id_metal = metal_masters.id
LEFT JOIN gold_kts ON cbpm.id_karat = gold_kts.id

WHERE 
    cbp.company_info_id = ${company_info_id?.data}
    AND cbp.is_deleted = '${DeletedStatus.No}'
    AND cbp.product_style = '${product_style}'
    AND cbp.product_length = ${product_length}
    AND cbp.dia_total_wt = ${dia_weight}
    AND cbp.setting_type = ${setting_style}
    AND cbp.hook_type = ${hook}
    AND cbp.product_dia_type = ${diamond_type}
    AND cbpm.id_metal = ${id_metal}
    AND cbpm.id_karat = ${id_karat}
    AND cbp.metal_weight_type = '${metal_weight_type}'
    AND cbpd_dia.id IS NOT NULL

GROUP BY 
    cbp.id,
    cbpm.id_metal,
    cbpm.id_karat,
    cs.value,
    metal_masters.id,
    cbpm.id,
    gold_kts.id
HAVING COUNT(cbpd_dia.id) = 2
ORDER BY cbp.id ASC;
      `,
        { type: QueryTypes.SELECT }
      )
    } else if (id_stone != null && id_color != null && id_clarity != null && alternate_id_stone != null && alternate_id_color == null && alternate_id_clarity == null && alternate_id_cut != null &&  id_stone != alternate_id_stone) {
      result = await req.body.db_connection.query(
        `SELECT 
                cbp.id,
                cbp.product_type,
                cbp.product_style,
                cbp.product_length,
                cbp.setting_type,
                cbp.hook_type,
                cbp.dia_total_wt,
                cbp.style_no,
                cbp.bracelet_no,
                cbp.product_title,
                cbp.sku,
                cbp.slug,
                cbp.product_sort_des,
                cbp.product_long_des,
                cbpm.id_metal,
                cbpm.id_karat,
                cbp.product_dia_type,
                cbp.metal_weight_type,
                cs.value AS total_diamond_wt,
              CASE WHEN cbpm.id_karat IS NULL THEN metal_masters.metal_rate * cbpm.metal_wt
                                + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN DDGM.rate ELSE DDGM.synthetic_rate END) 
                                * (CASE WHEN dstone.is_diamond = 1 THEN cbpd_dia.dia_wt ELSE 1 END) * cbpd_dia.dia_count),0)
                                + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN GDGM.rate ELSE GDGM.synthetic_rate END) 
                                * (CASE WHEN gstone.is_diamond = 1 THEN cbpd_gem.dia_wt ELSE 1 END) * cbpd_gem.dia_count),0)
              ELSE (metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.calculate_rate::double precision)  * cbpm.metal_wt
                                + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN DDGM.rate ELSE DDGM.synthetic_rate END) 
                                * (CASE WHEN dstone.is_diamond = 1 THEN cbpd_dia.dia_wt ELSE 1 END) * cbpd_dia.dia_count),0)
                                + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN GDGM.rate ELSE GDGM.synthetic_rate END) 
                                * (CASE WHEN gstone.is_diamond = 1 THEN cbpd_gem.dia_wt ELSE 1 END) * cbpd_gem.dia_count),0)
              END as product_price,
                json_build_object('id', cbpm.id, 'config_product_id', cbpm.config_product_id, 'id_metal', cbpm.id_metal, 'id_karat', cbpm.id_karat, 'metal_name', metal_masters.name, 'karat_value', gold_kts.name, 'labour_charge', cbpm.labour_charge, 'metal_wt', cbpm.metal_wt) AS metals
            FROM config_bracelet_products cbp

            LEFT JOIN carat_sizes cs ON cs.id::double precision = cbp.dia_total_wt
            JOIN config_bracelet_product_metals cbpm ON cbpm.config_product_id = cbp.id

            LEFT JOIN config_bracelet_product_diamonds cbpd_dia 
                ON cbpd_dia.config_product_id = cbp.id 
                AND cbpd_dia.id_stone = ${id_stone}
                AND cbpd_dia.id_shape = ${id_shape} 
                AND cbpd_dia.id_color = ${id_color} 
                AND cbpd_dia.id_clarity = ${id_clarity}
                AND cbpd_dia.id_cut IS NULL
            LEFT JOIN diamond_group_masters DDGM ON DDGM.id = cbpd_dia.id_diamond_group_master
            LEFT JOIN gemstones dstone ON dstone.id = cbpd_dia.id_stone

            LEFT JOIN config_bracelet_product_diamonds cbpd_gem 
                ON cbpd_gem.config_product_id = cbp.id 
                AND cbpd_gem.id_stone = ${alternate_id_stone}
                AND cbpd_gem.id_shape = ${alternate_id_shape}
                AND cbpd_gem.id_color IS NULL 
                AND cbpd_gem.id_clarity IS NULL
                AND cbpd_gem.id_cut = ${alternate_id_cut}
            LEFT JOIN diamond_group_masters GDGM ON GDGM.id = cbpd_gem.id_diamond_group_master
            LEFT JOIN gemstones gstone ON gstone.id = cbpd_gem.id_stone
            LEFT JOIN metal_masters ON cbpm.id_metal = metal_masters.id
            LEFT JOIN gold_kts ON cbpm.id_karat = gold_kts.id

            WHERE 
                cbp.company_info_id = ${company_info_id?.data}
                AND cbp.is_deleted = '${DeletedStatus.No}'
                AND cbp.product_style = '${product_style}'
                AND cbp.product_length = ${product_length}
                AND cbp.dia_total_wt = ${dia_weight}
                AND cbp.setting_type = ${setting_style}
                AND cbp.hook_type = ${hook}
                AND cbp.product_dia_type = ${diamond_type}
                AND cbpm.id_metal = ${id_metal}
                AND cbpm.id_karat = ${id_karat}
                AND cbp.metal_weight_type = '${metal_weight_type}'
                AND cbpd_dia.id IS NOT NULL   
                AND cbpd_gem.id IS NOT NULL 

            GROUP BY 
                cbp.id,
                cbpm.id_metal,
                cbpm.id_karat,
                cs.value,
                metal_masters.id,
                cbpm.id,
                gold_kts.id
            ORDER BY cbp.id ASC
            LIMIT 1
      `,
        { type: QueryTypes.SELECT }
      )
    } else if(id_stone != null && id_color == null && id_clarity == null && id_cut != null && alternate_id_stone != null && alternate_id_color == null && alternate_id_clarity == null && alternate_id_cut != null && id_stone == alternate_id_stone){
      result = await req.body.db_connection.query(
        `SELECT 
              cbp.id,
              cbp.product_type,
              cbp.product_style,
              cbp.product_length,
              cbp.setting_type,
              cbp.hook_type,
              cbp.dia_total_wt,
              cbp.style_no,
              cbp.bracelet_no,
              cbp.product_title,
              cbp.sku,
              cbp.slug,
              cbp.product_sort_des,
              cbp.product_long_des,
              cbpm.id_metal,
              cbpm.id_karat,
              cbp.product_dia_type,
              cbp.metal_weight_type,
              cs.value AS total_diamond_wt,
            CASE WHEN cbpm.id_karat IS NULL THEN metal_masters.metal_rate * cbpm.metal_wt
                              + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN DDGM.rate ELSE DDGM.synthetic_rate END) 
                              * (CASE WHEN dstone.is_diamond = 1 THEN cbpd_dia.dia_wt ELSE 1 END) * cbpd_dia.dia_count),0)
                              
            ELSE (metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.calculate_rate::double precision) * cbpm.metal_wt
                              + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN DDGM.rate ELSE DDGM.synthetic_rate END) 
                              * (CASE WHEN dstone.is_diamond = 1 THEN cbpd_dia.dia_wt ELSE 1 END) * cbpd_dia.dia_count),0)
                              
            END as product_price,
              json_build_object('id', cbpm.id, 'config_product_id', cbpm.config_product_id, 'id_metal', cbpm.id_metal, 'id_karat', cbpm.id_karat, 'metal_name', metal_masters.name, 'karat_value', gold_kts.name, 'labour_charge', cbpm.labour_charge, 'metal_wt', cbpm.metal_wt) AS metals
          FROM config_bracelet_products cbp

          LEFT JOIN carat_sizes cs ON cs.id::double precision = cbp.dia_total_wt
          JOIN config_bracelet_product_metals cbpm ON cbpm.config_product_id = cbp.id

          -- Diamond condition
          LEFT JOIN config_bracelet_product_diamonds cbpd_dia 
              ON cbpd_dia.config_product_id = cbp.id 
              AND cbpd_dia.id_stone = ${id_stone} 
              AND cbpd_dia.id_shape = ${id_shape} 
              AND cbpd_dia.id_color IS NULL
              AND cbpd_dia.id_clarity IS NULL 
              AND cbpd_dia.id_cut = ${id_cut}
          LEFT JOIN diamond_group_masters DDGM ON DDGM.id = cbpd_dia.id_diamond_group_master
          LEFT JOIN gemstones dstone ON dstone.id = cbpd_dia.id_stone
          LEFT JOIN metal_masters ON cbpm.id_metal = metal_masters.id
          LEFT JOIN gold_kts ON cbpm.id_karat = gold_kts.id

          WHERE 
              cbp.company_info_id = ${company_info_id?.data}
              AND cbp.is_deleted = '${DeletedStatus.No}'
              AND cbp.product_style = '${product_style}'
              AND cbp.product_length = ${product_length}
              AND cbp.dia_total_wt = ${dia_weight}
              AND cbp.setting_type = ${setting_style}
              AND cbp.hook_type = ${hook}
              AND cbp.product_dia_type = ${diamond_type}
              AND cbpm.id_metal = ${id_metal}
              AND cbpm.id_karat = ${id_karat}
              AND cbp.metal_weight_type = '${metal_weight_type}'
              AND cbpd_dia.id IS NOT NULL

          GROUP BY 
              cbp.id,
              cbpm.id_metal,
              cbpm.id_karat,
              cs.value,
              metal_masters.id,
              cbpm.id,
              gold_kts.id
          HAVING COUNT(cbpd_dia.id) = 2
          ORDER BY cbp.id ASC;
      `,
        { type: QueryTypes.SELECT }
      )
    } else if (id_stone != null && id_color == null && id_clarity == null && id_cut != null && alternate_id_stone != null && alternate_id_color == null && alternate_id_clarity == null && alternate_id_cut != null &&  id_stone != alternate_id_stone) {
      result = await req.body.db_connection.query(
        `SELECT 
                cbp.id,
                cbp.product_type,
                cbp.product_style,
                cbp.product_length,
                cbp.setting_type,
                cbp.hook_type,
                cbp.dia_total_wt,
                cbp.style_no,
                cbp.bracelet_no,
                cbp.product_title,
                cbp.sku,
                cbp.slug,
                cbp.product_sort_des,
                cbp.product_long_des,
                cbpm.id_metal,
                cbpm.id_karat,
                cbp.product_dia_type,
                cbp.metal_weight_type,
                cs.value AS total_diamond_wt,
              CASE WHEN cbpm.id_karat IS NULL THEN metal_masters.metal_rate * cbpm.metal_wt
                                + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN DDGM.rate ELSE DDGM.synthetic_rate END) 
                                * (CASE WHEN dstone.is_diamond = 1 THEN cbpd_dia.dia_wt ELSE 1 END) * cbpd_dia.dia_count),0)
                                + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN GDGM.rate ELSE GDGM.synthetic_rate END) 
                                * (CASE WHEN gstone.is_diamond = 1 THEN cbpd_gem.dia_wt ELSE 1 END) * cbpd_gem.dia_count),0)
              ELSE (metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.calculate_rate::double precision) * cbpm.metal_wt
                                + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN DDGM.rate ELSE DDGM.synthetic_rate END) 
                                * (CASE WHEN dstone.is_diamond = 1 THEN cbpd_dia.dia_wt ELSE 1 END) * cbpd_dia.dia_count),0)
                                + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN GDGM.rate ELSE GDGM.synthetic_rate END) 
                                * (CASE WHEN gstone.is_diamond = 1 THEN cbpd_gem.dia_wt ELSE 1 END) * cbpd_gem.dia_count),0)
              END as product_price,
                json_build_object('id', cbpm.id, 'config_product_id', cbpm.config_product_id, 'id_metal', cbpm.id_metal, 'id_karat', cbpm.id_karat, 'metal_name', metal_masters.name, 'karat_value', gold_kts.name, 'labour_charge', cbpm.labour_charge, 'metal_wt', cbpm.metal_wt) AS metals
            FROM config_bracelet_products cbp

            LEFT JOIN carat_sizes cs ON cs.id::double precision = cbp.dia_total_wt
            JOIN config_bracelet_product_metals cbpm ON cbpm.config_product_id = cbp.id

            LEFT JOIN config_bracelet_product_diamonds cbpd_dia 
                ON cbpd_dia.config_product_id = cbp.id 
                AND cbpd_dia.id_stone = ${id_stone}
                AND cbpd_dia.id_shape = ${id_shape} 
                AND cbpd_dia.id_color IS NULL 
                AND cbpd_dia.id_clarity IS NULL 
                AND cbpd_dia.id_cut = ${id_cut}
            LEFT JOIN diamond_group_masters DDGM ON DDGM.id = cbpd_dia.id_diamond_group_master
            LEFT JOIN gemstones dstone ON dstone.id = cbpd_dia.id_stone

            LEFT JOIN config_bracelet_product_diamonds cbpd_gem 
                ON cbpd_gem.config_product_id = cbp.id 
                AND cbpd_gem.id_stone = ${alternate_id_stone}
                AND cbpd_gem.id_shape = ${alternate_id_shape}
                AND cbpd_gem.id_color IS NULL 
                AND cbpd_gem.id_clarity IS NULL
                AND cbpd_gem.id_cut = ${alternate_id_cut}
                AND cbpd_gem.alternate_stone = 'true'

            LEFT JOIN diamond_group_masters GDGM ON GDGM.id = cbpd_gem.id_diamond_group_master
            LEFT JOIN gemstones gstone ON gstone.id = cbpd_gem.id_stone
            LEFT JOIN metal_masters ON cbpm.id_metal = metal_masters.id
            LEFT JOIN gold_kts ON cbpm.id_karat = gold_kts.id

            WHERE 
                cbp.company_info_id = ${company_info_id?.data}
                AND cbp.is_deleted = '${DeletedStatus.No}'
                AND cbp.product_style = '${product_style}'
                AND cbp.product_length = ${product_length}
                AND cbp.dia_total_wt = ${dia_weight}
                AND cbp.setting_type = ${setting_style}
                AND cbp.hook_type = ${hook}
                AND cbp.product_dia_type = ${diamond_type}
                AND cbpm.id_metal = ${id_metal}
                AND cbpm.id_karat = ${id_karat}
                AND cbp.metal_weight_type = '${metal_weight_type}'
                AND cbpd_dia.id IS NOT NULL   
                AND cbpd_gem.id IS NOT NULL 

            GROUP BY 
                cbp.id,
                cbpm.id_metal,
                cbpm.id_karat,
                cs.value,
                metal_masters.id,
                cbpm.id,
                gold_kts.id
            ORDER BY cbp.id ASC
            LIMIT 1
      `,
        { type: QueryTypes.SELECT }
      )
    } else {
      result = await req.body.db_connection.query(
        `SELECT 
            cbp.id,
            cbp.product_type,
            cbp.product_style,
            cbp.product_length,
            cbp.setting_type,
            cbp.hook_type,
            cbp.dia_total_wt,
            cbp.style_no,
            cbp.bracelet_no,
            cbp.product_title,
            cbp.sku,
            cbp.slug,
            cbp.product_sort_des,
            cbp.product_long_des,
            cbpm.id_metal,
            cbpm.id_karat,
            cbp.product_dia_type,
            cbp.metal_weight_type,
            cs.value AS total_diamond_wt,
          CASE WHEN cbpm.id_karat IS NULL THEN metal_masters.metal_rate * cbpm.metal_wt
                            + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN DDGM.rate ELSE DDGM.synthetic_rate END) 
                            * (CASE WHEN dstone.is_diamond = 1 THEN cbpd_dia.dia_wt ELSE 1 END) * cbpd_dia.dia_count),0)
                            
          ELSE (metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.calculate_rate::double precision) * cbpm.metal_wt
                            + COALESCE(SUM((CASE WHEN cbp.product_dia_type = 1 THEN DDGM.rate ELSE DDGM.synthetic_rate END) 
                            * (CASE WHEN dstone.is_diamond = 1 THEN cbpd_dia.dia_wt ELSE 1 END) * cbpd_dia.dia_count),0)
                            
          END as product_price,
            json_build_object('id', cbpm.id, 'config_product_id', cbpm.config_product_id, 'id_metal', cbpm.id_metal, 'id_karat', cbpm.id_karat, 'metal_name', metal_masters.name, 'karat_value', gold_kts.name, 'labour_charge', cbpm.labour_charge, 'metal_wt', cbpm.metal_wt) AS metals
        FROM config_bracelet_products cbp

        LEFT JOIN carat_sizes cs ON cs.id::double precision = cbp.dia_total_wt
        JOIN config_bracelet_product_metals cbpm ON cbpm.config_product_id = cbp.id

        -- Diamond condition
        LEFT JOIN config_bracelet_product_diamonds cbpd_dia 
            ON cbpd_dia.config_product_id = cbp.id 
            AND cbpd_dia.id_stone = ${id_stone} 
            AND cbpd_dia.id_shape = ${id_shape} 
            AND cbpd_dia.id_color = ${id_color} 
            AND cbpd_dia.id_clarity = ${id_clarity} 
            AND cbpd_dia.id_cut IS NULL
        LEFT JOIN diamond_group_masters DDGM ON DDGM.id = cbpd_dia.id_diamond_group_master
        LEFT JOIN gemstones dstone ON dstone.id = cbpd_dia.id_stone
        LEFT JOIN metal_masters ON cbpm.id_metal = metal_masters.id
        LEFT JOIN gold_kts ON cbpm.id_karat = gold_kts.id

        WHERE 
            cbp.company_info_id = ${company_info_id?.data}
            AND cbp.is_deleted = '${DeletedStatus.No}'
            AND cbp.product_style = '${product_style}'
            AND cbp.product_length = ${product_length}
            AND cbp.dia_total_wt = ${dia_weight}
            AND cbp.setting_type = ${setting_style}
            AND cbp.hook_type = ${hook}
            AND cbp.product_dia_type = ${diamond_type}
            AND cbpm.id_metal = ${id_metal}
            AND cbpm.id_karat = ${id_karat}
            AND cbp.metal_weight_type = '${metal_weight_type}'
            AND cbpd_dia.id IS NOT NULL

        GROUP BY 
            cbp.id,
            cbpm.id_metal,
            cbpm.id_karat,
            cs.value,
            metal_masters.id,
            cbpm.id,
            gold_kts.id
        HAVING COUNT(cbpd_dia.id) = 2
        ORDER BY cbp.id ASC;
      `,
        { type: QueryTypes.SELECT }
      )
    }
    if (result && result.length == 0) {
      return resSuccess({message: PRODUCT_NOT_FOUND})
    }

    const diamond_details = await req.body.db_connection.query(
      ` select JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id',

									CBPDO.ID,
									'config_product_id',
									CBPDO.CONFIG_PRODUCT_ID,
									'stone_type',
									CBPDO.STONE_TYPE,
									'id_stone',
									CBPDO.ID_STONE,
									'id_shape',
									CBPDO.ID_SHAPE,
									'id_mm_size',
									CBPDO.ID_MM_SIZE,
									'id_color',
									CBPDO.ID_COLOR,
									'id_clarity',
									CBPDO.ID_CLARITY,
									'id_cut',
									CBPDO.ID_CUT,
									'id_carat',
									CBPDO.ID_CARAT,
									'dia_wt',
									CBPDO.DIA_WT,
									'dia_count',
									CBPDO.DIA_COUNT,
									'id_diamond_group_master',
									CBPDO.ID_DIAMOND_GROUP_MASTER,
									'diamond_shape_name',
									PDS.NAME,
									'diamond_cut_value',
									CUTS.VALUE,
									'diamond_clarity_value',
									CLARITIES.VALUE,
									'diamond_color_name',
									COLORS.VALUE,
									'stone_name',
									PSD.NAME,
									'stone_sort_code',
									PSD.SORT_CODE,
									'alternate_stone',
									CBPDO.ALTERNATE_STONE)) AS DIAMOND_DETAILS
									
								FROM config_bracelet_product_diamonds CBPDO
								LEFT JOIN diamond_shapes PDS ON  PDS.id = CBPDO.id_shape
								LEFT JOIN cuts ON cuts.id = CBPDO.id_cut
								LEFT JOIN CLARITIES ON CLARITIES.id = CBPDO.id_clarity
								LEFT JOIN colors ON colors.id = CBPDO.id_color
								LEFT JOIN gemstones PSD ON psd.id = CBPDO.id_stone
								WHERE CBPDO.config_product_id = ${result[0].id}`, {
        type: QueryTypes.SELECT}
    )
    const product = {
      ...result[0],
      diamond_details: diamond_details[0].diamond_details,
      product_price: await req.formatPrice(result[0].product_price, PRICE_CORRECTION_PRODUCT_TYPE.BracelateConfigurator),
    };
    return resSuccess({ data: product });
  } catch (error) {
    throw error;
  }
};