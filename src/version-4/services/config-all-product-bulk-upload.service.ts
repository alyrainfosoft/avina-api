import { Request } from "express";
import {
  addActivityLogs,
  columnValueLowerCase,
  getLocalDate,
  prepareMessageFromParams,
  refreshMaterializedRingThreeStoneConfiguratorPriceFindView,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../utils/shared-functions";
import {
  DATA_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  FILE_NOT_FOUND,
  INVALID_HEADER,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  PRODUCT_NOT_FOUND,
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
  CONFIG_PRODUCT_IMPORT_FILE_TYPE,
  DeletedStatus,
  DIAMOND_TYPE,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  LogsActivityType,
  LogsType,
} from "../../utils/app-enumeration";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import { initModels } from "../model/index.model";
import { Op, Sequelize } from "sequelize";

const readXlsxFile = require("read-excel-file/node");

export const addAllConfigProductsFromNewCSVFile = async (req: Request) => {
  try {
    const {ProductBulkUploadFile} = initModels(req);
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

    //   if (resRows.data.batchSize > PRODUCT_BULK_UPLOAD_BATCH_SIZE) {
    //     return resUnprocessableEntity({
    //       message: PRODCUT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
    //     });
    //   }

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
              shank_type: row[3],
              setting_type: row[4],
              head_type: row[5],
              center_dia_wt: row[6],
              center_dia_shape: row[7],
              center_dia_mm_size: row[8],
              center_natural_dia_clarity_color: row[9],
              center_lab_grown_dia_clarity_color: row[10],
              center_dia_count: row[11],
              natural_january: row[12],
              synthetic_january: row[13],
              natural_february: row[14],
              synthetic_february: row[15],
              natural_march: row[16],
              synthetic_march: row[17],
              natural_april: row[18],
              synthetic_april: row[19],
              natural_may: row[20],
              synthetic_may: row[21],
              natural_june: row[22],
              synthetic_june: row[23],
              natural_july: row[24],
              synthetic_july: row[25],
              natural_august: row[26],
              synthetic_august: row[27],
              natural_september: row[28],
              synthetic_september: row[29],
              natural_october: row[30],
              synthetic_october: row[31],
              natural_november: row[32],
              synthetic_november: row[33],
              natural_december: row[34],
              synthetic_december: row[35],
              side_dia_prod_type: row[36],
              product_dia_type: row[37],
              product_dia_shape: row[38],
              product_dia_mm_size: row[39],
              product_dia_clarity: row[40],
              product_dia_color: row[41],
              product_dia_cut: row[42],
              product_dia_carat: row[43],
              product_dia_cost: row[44],
              product_dia_count: row[45],
              head_no: row[46],
              shank_no: row[47],
              band_no: row[48],
              style_no: row[49],
              style_no_WB: row[50],
              short_description: row[51],
              long_description: row[52],
              head_shank: row[53],
              KT_9: row[54],
              KT_10: row[55],
              KT_14: row[56],
              KT_18: row[57],
              KT_22: row[58],
              silver: row[59],
              platinum: row[60],
              metal_tone: row[61],
              labour_charge: row[62],
              other_charge: row[63],
              Margin: row[64],
              product_total_diamond: row[65],
              render_folder_name: row[66],
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
    "shank_type",
    "setting_type",
    "head_type",
    "center_dia_wt",
    "center_dia_shape",
    "center_dia_mm_size",
    "center_natural_dia_clarity_color",
    "center_lab_grown_dia_clarity_color",
    "center_dia_count",
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
    "side_dia_prod_type",
    "product_dia_type",
    "product_dia_shape",
    "product_dia_mm_size",
    "product_dia_clarity",
    "product_dia_color",
    "product_dia_cut",
    "product_dia_carat",
    "product_dia_cost",
    "product_dia_count",
    "head_no",
    "shank_no",
    "band_no",
    "style_no",
    "style_no_WB",
    "short_description",
    "long_description",
    "head_shank",
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
    "Margin",
    "product_total_diamond",
    "render_folder_name",
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

const getProductsFromRows = async (rows: any, client_id: number, req: Request) => {
    const {ShanksData,HeadsData,SideSettingStyles,DiamondShape,DiamondCaratSize,StoneData,MMSizeData,Colors,ClarityData,CutsData,MetalMaster,GoldKarat, DiamondGroupMaster} = initModels(req);
  
  let currentProductIndex = -1;
  let productList: any = [];
  let centerDiamondColorClarity;
  let where = { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No,company_info_id:client_id };
  try {
    let errors: {
      head_no: any;
      shank_no: any;
      band_no: any;
      error_message: string;
    }[] = [];
    const shankList = await ShanksData.findAll({ where });
    const headList = await HeadsData.findAll({ where });
    const sideSettingList = await SideSettingStyles.findAll({ where });
    const diamondShapeList = await DiamondShape.findAll({ where });
    const DiamondCaratSizeList = await DiamondCaratSize.findAll({ where });
    const stoneList = await StoneData.findAll({ where });
    const mmSizeList = await MMSizeData.findAll({ where });
    const colorList = await Colors.findAll({ where });
    const clarityList = await ClarityData.findAll({ where });
    const cutsList = await CutsData.findAll({ where });
    const metalList = await MetalMaster.findAll({ where });
    const karatList = await GoldKarat.findAll({ where });
    const diamondGroupMasterList = await DiamondGroupMaster.findAll({ where });
    for (const row of rows) {
      if (row.parent_sku_details == "1") {
        if (row.product_type == null) {
          errors.push({
            head_no: row.head_no || row.style_no || row.style_no,
            shank_no: row.shank_no,
            band_no: row.band_no,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "product Type"],
            ]),
          });
        }
        if (
          row.product_type.toLocaleLowerCase() == "ring" &&
          row.shank_type == null
        ) {
          errors.push({
            head_no: row.head_no || row.style_no,
            shank_no: row.shank_no,
            band_no: row.band_no,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Shank Type"],
            ]),
          });
        }

        if (
          row.product_type.toLocaleLowerCase() == "ring" &&
          row.setting_type == null
        ) {
          errors.push({
            head_no: row.head_no || row.style_no,
            shank_no: row.shank_no,
            band_no: row.band_no,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Setting Type"],
            ]),
          });
        }

        if (
          row.product_type.toLocaleLowerCase() == "ring" &&
          row.head_type == null
        ) {
          errors.push({
            head_no: row.head_no || row.style_no,
            shank_no: row.shank_no,
            band_no: row.band_no,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Head Type"],
            ]),
          });
        }

        const shak_type = await getIdFromName(
          row.shank_type,
          shankList,
          "name"
        );
        if (row.product_type.toLocaleLowerCase() == "ring") {
          if (!shak_type || shak_type == undefined || shak_type == "") {
            errors.push({
              head_no: row.head_no || row.style_no,
              shank_no: row.shank_no,
              band_no: row.band_no,
              error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
                ["field_name", "shank type"],
              ]),
            });
          }
        }

        const setting_type = await getIdFromName(
          row.setting_type,
          sideSettingList,
          "name"
        );
        if (row.product_type.toLocaleLowerCase() == "ring") {
          if (
            !setting_type ||
            setting_type == undefined ||
            setting_type == ""
          ) {
            errors.push({
              head_no: row.head_no || row.style_no,
              shank_no: row.shank_no,
              band_no: row.band_no,
              error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
                ["field_name", "setting type"],
              ]),
            });
          }
        }
        const head_type = await getIdFromName(row.head_type, headList, "name");
        if (row.product_type.toLocaleLowerCase() == "ring") {
          if (!head_type || head_type == undefined || head_type == "") {
            errors.push({
              head_no: row.head_no || row.style_no,
              shank_no: row.shank_no,
              band_no: row.band_no,
              error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
                ["field_name", "head type"],
              ]),
            });
          }
        }

        if (row.product_type.toLocaleLowerCase() == "birthstone") {
          if (row.product_total_diamond == null) {
            errors.push({
              head_no: row.head_no || row.style_no,
              shank_no: row.shank_no,
              band_no: row.band_no,
              error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                ["field_name", "product Total Diamond"],
              ]),
            });
          }
        }
        if (row.product_type.toLocaleLowerCase() == "birthstone") {
          if (row.style_no == null) {
            errors.push({
              head_no: row.head_no || row.style_no,
              shank_no: row.shank_no,
              band_no: row.band_no,
              error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                ["field_name", "style number"],
              ]),
            });
          }
        }
        currentProductIndex++;
        productList.push({
          shak_type: shak_type,
          setting_type: setting_type,
          product_type: row.product_type,
          product_style: row.product_style,
          product_total_diamond: row.center_dia_count,
          style_no: row.style_no,
          style_no_wb: row.style_no_WB,
          head_type: head_type,
          head_no: row.head_no || row.style_no,
          shank_no: row.shank_no,
          ring_no:
            row.product_type.toLocaleLowerCase() == "ring"
              ? row.style_no
              : null,
          band_no: row.band_no,
          center_stone: "",
          center_dia_shape: "",
          center_dia_carat: "",
          center_dia_mm_size: "",
          center_dia_color: "",
          center_dia_clarity: "",
          center_dia_count: "",
          center_dia_cut: "",
          center_dia_group: "",
          center_dia_type: 1,
          product_name:
            row.render_folder_name +
            "_" +
            row.head_no +
            "_" +
            row.shank_no +
            "_" +
            row.band_no,
          long_description: row.long_description,
          sort_description: row.short_description,
          laber_charge: row.labour_charge,
          other_charge: row.other_charge,
          product_metal_details: [
            {
              product9KTList: [],
              product10KTList: [],
              product14KTList: [],
              product18KTList: [],
              product22KTList: [],
              productSilverList: [],
              productPlatinumList: [],
            },
          ],
          product_diamond_details: [],
          Product_center_diamond_details: [],
          product_metal_data: [],
        });
        await addProductDetailsToProductList(
          row,
          productList,
          currentProductIndex,
          stoneList,
          diamondShapeList,
          DiamondCaratSizeList,
          mmSizeList,
          colorList,
          clarityList,
          cutsList
        );
      } else if (row.parent_sku_details == "0") {
        await addProductDetailsToProductList(
          row,
          productList,
          currentProductIndex,
          stoneList,
          diamondShapeList,
          DiamondCaratSizeList,
          mmSizeList,
          colorList,
          clarityList,
          cutsList
        );
      }
    }

    const metalProductList = await setMetalProductList(productList);

    const centerDiamondList = await setCenterDiamondProductList(
      metalProductList,
      stoneList,
      diamondShapeList,
      DiamondCaratSizeList,
      mmSizeList,
      colorList,
      clarityList,
      cutsList
    );

    centerDiamondColorClarity = await setCenterDiamondColorAndClaritySet(
      centerDiamondList,
      colorList,
      clarityList,
      cutsList
    );

    const resCDO: any = await setCenterDiamondGroupMaster(
      centerDiamondColorClarity,
      diamondGroupMasterList
    );

    if (resCDO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resCDO.data.map((t: any) =>
        errors.push({
          head_no: t.head_no,
          shank_no: t.shank_no,
          band_no: t.band_no,
          error_message: t.error_message,
        })
      );
    }

    const resSMO = await setProductMetalDetails(
      centerDiamondColorClarity,
      metalList,
      karatList,
      client_id,
      req
    );

    if (resSMO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSMO.data.map((t: any) =>
        errors.push({
          head_no: t.head_no,
          shank_no: t.shank_no,
          band_no: t.band_no,
          error_message: t.error_message,
        })
      );
    }

    const resSDO = await setDiamondOptions(productList, diamondGroupMasterList, DiamondCaratSizeList);

    if (resSDO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSDO.data.map((t: any) =>
        errors.push({
          head_no: t.head_no,
          shank_no: t.shank_no,
          band_no: t.band_no,
          error_message: t.error_message,
        })
      );
    }

    if (errors.length > 0) {
      return resUnprocessableEntity({ data: errors });
    }
    return resSuccess({ data: resSMO.data });
  } catch (e) {
    throw e;
  }
};

const getIdFromName = (name: string, list: any, fieldName: string) => {
  if (name == null || name == "") {
    return null;
  }

  let findItem = list.find(
    (item: any) =>
      item.dataValues[fieldName].toString().trim().toLocaleLowerCase() ==
      name.toString().trim().toLocaleLowerCase()
  );
  if (findItem) {
    return findItem.dataValues.id;
  }
};

const getValueFromId = (
  list: any,
  name: string,
  fieldName: string,
  returnValue: any
) => {
  if (name == null || name == "") {
    return null;
  }

  let findItem = list.find(
    (item: any) =>
      item.dataValues[fieldName].toString().trim().toLocaleLowerCase() ==
      name.toString().trim().toLocaleLowerCase()
  );
  if (findItem) {
    return findItem.dataValues[returnValue];
  }
};

const addProductDetailsToProductList = async (
  row: any,
  productList: any,
  currentProductIndex: number,
  stoneList: any,
  diamondShapeList: any,
  DiamondCaratSizeList: any,
  mmSizeList: any,
  colorList: any,
  clarityList: any,
  cutsList: any
) => {
  if (productList[currentProductIndex]) {
    if (row.side_dia_prod_type && row.side_dia_prod_type !== "") {
      productList[currentProductIndex].product_diamond_details.push({
        prod_type: row.side_dia_prod_type,
        shape: await getIdFromName(
          row.product_dia_shape,
          diamondShapeList,
          "name"
        ),
        stone: await getIdFromName(row.product_dia_type, stoneList, "name"),
        color: row.product_dia_color
          ? await getIdFromName(row.product_dia_color, colorList, "value")
          : null,
        mm_size: row.product_dia_mm_size
          ? await getIdFromName(
              row.product_dia_mm_size.toString(),
              mmSizeList,
              "value"
            )
          : null,
        clarity: row.product_dia_clarity
          ? await getIdFromName(row.product_dia_clarity, clarityList, "value")
          : null,
        carat: row.product_dia_carat,
        cut: row.product_dia_cut
          ? await getIdFromName(row.product_dia_cut, cutsList, "value")
          : null,
        stone_count: row.product_dia_count,
        stone_cost: row.product_dia_cost,
        product_dia_group: null,
      });
    }

    if (row.head_shank && row.head_shank !== "") {
      if (row.KT_9 && row.KT_9 !== "") {
        productList[
          currentProductIndex
        ].product_metal_details[0].product9KTList.push({
          head_shank: row.head_shank,
          metal: "gold",
          karat: 9,
          metal_tone: row.metal_tone,
          metal_weight: row.KT_9,
          labor_charge: row.labour_charge ? row.labour_charge : null,
        });
      }
      if (row.KT_10 && row.KT_10 !== "") {
        productList[
          currentProductIndex
        ].product_metal_details[0].product10KTList.push({
          head_shank: row.head_shank,
          metal: "gold",
          karat: 10,
          metal_tone: row.metal_tone,
          metal_weight: row.KT_10,
          labor_charge: row.labour_charge ? row.labour_charge : null,
        });
      }
      if (row.KT_14 && row.KT_14 !== "") {
        productList[
          currentProductIndex
        ].product_metal_details[0].product14KTList.push({
          head_shank: row.head_shank,
          metal: "gold",
          karat: 14,
          metal_tone: row.metal_tone,
          metal_weight: row.KT_14,
          labor_charge: row.labour_charge ? row.labour_charge : null,
        });
      }
      if (row.KT_18 && row.KT_18 !== "") {
        productList[
          currentProductIndex
        ].product_metal_details[0].product18KTList.push({
          head_shank: row.head_shank,
          metal: "gold",
          karat: 18,
          metal_tone: row.metal_tone,
          metal_weight: row.KT_18,
          labor_charge: row.labour_charge ? row.labour_charge : null,
        });
      }
      if (row.KT_22 && row.KT_22 !== "") {
        productList[
          currentProductIndex
        ].product_metal_details[0].product22KTList.push({
          head_shank: row.head_shank,
          metal: "gold",
          karat: 22,
          metal_tone: row.metal_tone,
          metal_weight: row.KT_22,
          labor_charge: row.labour_charge ? row.labour_charge : null,
        });
      }
      if (row.silver && row.silver !== "") {
        productList[
          currentProductIndex
        ].product_metal_details[0].productSilverList.push({
          head_shank: row.head_shank,
          metal: "silver",
          karat: null,
          metal_tone: null,
          metal_weight: row.silver,
          labor_charge: row.labour_charge ? row.labour_charge : null,
        });
      }
      if (row.platinum && row.platinum !== "") {
        productList[
          currentProductIndex
        ].product_metal_details[0].productPlatinumList.push({
          head_shank: row.head_shank,
          metal: "platinum",
          karat: null,
          metal_tone: null,
          metal_weight: row.platinum,
          labor_charge: row.labour_charge ? row.labour_charge : null,
        });
      }
    }
    if (
      row.center_natural_dia_clarity_color &&
      row.center_natural_dia_clarity_color !== ""
    ) {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "diamond",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: row.center_natural_dia_clarity_color,
        center_dia_cuts: null,
        center_dia_count: row.center_dia_count,
      });
    }
    if (
      row.center_lab_grown_dia_clarity_color &&
      row.center_lab_grown_dia_clarity_color !== ""
    ) {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "diamond",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: row.center_lab_grown_dia_clarity_color,
        center_dia_cuts: null,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_january && row.natural_january !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "january",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_january,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_january && row.synthetic_january !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "january",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_january,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_february && row.natural_february !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "february",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_february,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_february && row.synthetic_february !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "february",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_february,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_march && row.natural_march !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "march",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_march,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_march && row.synthetic_march !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "march",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_march,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_april && row.natural_april !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "april",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_april,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_april && row.synthetic_april !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "april",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_april,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_may && row.natural_may !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "may",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_may,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_may && row.synthetic_may !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "may",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_may,
        center_dia_count: row.center_dia_count,
      });
    }

    if (row.natural_june && row.natural_june !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "june",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_june,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_june && row.synthetic_june !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "june",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_june,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_july && row.natural_july !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "july",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_july,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_july && row.synthetic_july !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "july",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_july,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_august && row.natural_august !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "august",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_august,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_august && row.synthetic_august !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "august",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_august,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_september && row.natural_september !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "september",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_september,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_september && row.synthetic_september !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "september",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_september,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_october && row.natural_october !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "october",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_october,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_october && row.synthetic_october !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "october",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_october,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_november && row.natural_november !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "november",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_november,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_november && row.synthetic_november !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "november",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_november,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_december && row.natural_december !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "december",
        diamond_type: DIAMOND_TYPE.natural,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_december,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_december && row.synthetic_december !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "december",
        diamond_type: DIAMOND_TYPE.synthetic,
        center_dia_carat: row.center_dia_wt,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_december,
        center_dia_count: row.center_dia_count,
      });
    }
  }
};

const getPipedIdFromField = async (
  model: any,
  fieldValue: string,
  fieldName: string
) => {
  if (fieldValue == null || fieldValue === "") {
    return null;
  }
  let findData = await model.findOne({
    where: {
      [fieldName]: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col(`${[fieldName]}`)),
        "=",
        fieldValue.toString().toLocaleLowerCase()
      ),
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
    },
  });

  return findData ? findData.dataValues.id : null;
};

const setMetalProductList = async (productList: any) => {
  try {
    let productData = [];

    for (let index = 0; index < productList.length; index++) {
      const element = productList[index].product_metal_details;

      if (element[0].product9KTList.length > 0) {
        productData.push({
          ...productList[index],
          product_metal_data: element[0].product9KTList,
          product_metal_details: [],
        });
      }
      if (element[0].product10KTList.length > 0) {
        productData.push({
          ...productList[index],
          product_metal_data: element[0].product10KTList,
          product_metal_details: [],
        });
      }
      if (element[0].product14KTList.length > 0) {
        productData.push({
          ...productList[index],
          product_metal_data: element[0].product14KTList,
          product_metal_details: [],
        });
      }
      if (element[0].product18KTList.length > 0) {
        productData.push({
          ...productList[index],
          product_metal_data: element[0].product18KTList,
          product_metal_details: [],
        });
      }
      if (element[0].product22KTList.length > 0) {
        productData.push({
          ...productList[index],
          product_metal_data: element[0].product22KTList,
          product_metal_details: [],
        });
      }
      if (element[0].productSilverList.length > 0) {
        productData.push({
          ...productList[index],
          product_metal_data: element[0].productSilverList,
          product_metal_details: [],
        });
      }
      if (element[0].productPlatinumList.length > 0) {
        productData.push({
          ...productList[index],
          product_metal_data: element[0].productPlatinumList,
          product_metal_details: [],
        });
      }
    }

    return productData;
  } catch (error) {
    throw error;
  }
};

const setCenterDiamondProductList = async (
  productList: any,
  stoneList: any,
  diamondShapeList: any,
  DiamondCaratSizeList: any,
  mmSizeList: any,
  colorList: any,
  clarityList: any,
  cutsList
) => {
  try {
    let where = { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No };
    let productData = [];
    for (let index = 0; index < productList.length; index++) {
      const element: any[] = productList[index].Product_center_diamond_details;

      if (element.length > 0) {
        for (let j = 0; j < element.length; j++) {
          productData.push({
            ...productList[index],
            center_stone: await getIdFromName(
              element[j].center_stone,
              stoneList,
              "sort_code"
            ),
            center_dia_shape: await getIdFromName(
              element[j].center_dia_shape,
              diamondShapeList,
              "name"
            ),
            center_dia_carat: await getIdFromName(
              element[j].center_dia_carat,
              DiamondCaratSizeList,
              "value"
            ),
            center_dia_mm_size: await getIdFromName(
              element[j].center_dia_mm_size,
              mmSizeList,
              "value"
            ),
            center_dia_type: element[j].diamond_type,
            center_dia_color:
              element[j].center_dia_color_clarity &&
              element[j].center_dia_color_clarity
                .split(",")
                .map((value: any) => value.split("|")[0]),
            center_dia_clarity:
              element[j].center_dia_color_clarity &&
              element[j].center_dia_color_clarity
                .split(",")
                .map((value: any) => value.split("|")[1]),
            center_dia_count: element[j].center_dia_count,
            center_dia_cut:
              element[j].center_dia_cuts &&
              element[j].center_dia_cuts.split("|"),
            Product_center_diamond_details: [],
          });
        }
      } else {
        productData.push({ ...productList[index] });
      }
    }

    return productData;
  } catch (error) {
    throw error;
  }
};

const setCenterDiamondColorAndClaritySet = async (
  productList: any,
  colorList,
  clarityList,
  cutsList
) => {
  try {
    let productData = [];
    let where = { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No };

    for (let index = 0; index < productList.length; index++) {
      if (productList[index].center_dia_color) {
        for (let j = 0; j < productList[index].center_dia_color.length; j++) {
          const color = productList[index].center_dia_color[j];
          const clarity = productList[index].center_dia_clarity[j];
          productData.push({
            ...productList[index],
            center_dia_color: await getIdFromName(color, colorList, "value"),
            center_dia_clarity: await getIdFromName(
              clarity,
              clarityList,
              "value"
            ),
          });
        }
      } else if (productList[index].center_dia_cut) {
        for (let j = 0; j < productList[index].center_dia_cut.length; j++) {
          const cut = productList[index].center_dia_cut[j];
          productData.push({
            ...productList[index],
            center_dia_cut: await getIdFromName(cut, cutsList, "value"),
          });
        }
      } else {
        productData.push({ ...productList[index] });
      }
    }

    return productData;
  } catch (error) {
    throw error;
  }
};

const setCenterDiamondGroupMaster = async (
  productList: any,
  diamondGroupMasterList: any
) => {
  let length = productList.length,
    i: any;
  let errors: {
    head_no: any;
    shank_no: any;
    band_no: any;
    error_message: string;
  }[] = [];

  for (i = 0; i < length; i++) {
    const diamondGroupMaster = diamondGroupMasterList.find((item: any) => {
      return (
        item.dataValues.id_stone === (productList[i].center_stone || null) &&
        item.dataValues.id_shape ===
          (productList[i].center_dia_shape || null) &&
        item.dataValues.id_color ===
          (productList[i].center_dia_color || null) &&
        item.dataValues.id_clarity ===
          (productList[i].center_dia_clarity || null) &&
        item.dataValues.id_carat ===
          (productList[i].center_dia_carat || null) &&
        item.dataValues.id_cuts === (productList[i].center_dia_cut || null)
      );
    });

    if (diamondGroupMaster == null) {
      errors.push({
        head_no: productList[i].head_no,
        shank_no: productList[i].shank_no,
        band_no: productList[i].band_no,
        error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
          ["field_name", "center diamond group"],
        ]),
      });
    }

    productList[i].center_dia_group =
      diamondGroupMaster && diamondGroupMaster.dataValues
        ? diamondGroupMaster?.dataValues.id
        : null;
  }

  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};

const setProductMetalDetails = async (
  productList: any,
  metalList: any,
  karatList: any,
  client_id:number,
  req: any
) => {
  const {MetalTone} = await initModels(req);
  let configMetalNameList = [],
    configKaratNameList = [],
    pmo;
  let productData = [];
  let errors: {
    head_no: any;
    shank_no: any;
    band_no: any;
    error_message: string;
  }[] = [];
  for (let product of productList) {
    for (pmo of product.product_metal_data) {
      pmo.metal &&
        configMetalNameList.push(pmo.metal.toString().toLocaleLowerCase());
      pmo.karat && configKaratNameList.push(pmo.karat);
    }
  }

  for (const product of productList) {
    const newProduct = {
      ...product,
      product_metal_data: [],
    };
    for (const metalObject of product.product_metal_data) {
      const newMetalObject = {
        ...metalObject,
        metal: getIdFromName(metalObject.metal, metalList, "name"),
        karat: getIdFromName(metalObject.karat, karatList, "name"),
        metal_tone: await getPipedIdFromFieldValue(
          MetalTone,
          metalObject.metal_tone,
          "sort_code",
          client_id
        ),
      };
      newProduct.product_metal_data.push(newMetalObject);
    }

    productData.push(newProduct);
  }

  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess({ data: productData });
};

const setDiamondOptions = async (
  productList: any,
  diamondGroupMasterList: any,
  diamondSizeList : any
) => {
  let configGroupNameList = [],
    configStoneSettingList = [],
    pmo,
    length = productList.length,
    i: any,
    k,
    pmoLength = 0;
  let errors: {
    head_no: any;
    shank_no: any;
    band_no: any;
    error_message: string;
  }[] = [];
  let stoneTypeList: any[] = [];

  for (let product of productList) {
    for (pmo of product.product_diamond_details) {
      pmo.diamond_group &&
        configGroupNameList.push(
          pmo.diamond_group.toString().toLocaleLowerCase()
        );
      pmo.stone_setting &&
        configStoneSettingList.push(
          pmo.stone_setting.toString().toLocaleLowerCase()
        );
    }
  }

  for (i = 0; i < length; i++) {
    pmoLength = productList[i].product_diamond_details.length;
    for (k = 0; k < pmoLength; k++) {
      if (productList[i].product_type.toLocaleLowerCase() == "ring") {
        const diamondStone = prepareDynamicMessage(
          "stone",
          productList[i].product_diamond_details[k]
        );
        diamondStone?.data.map((t: any) =>
          errors.push({
            head_no: productList[i].head_no,
            shank_no: productList[i].shank_no,
            band_no: productList[i].band_no,
            error_message: t.error_message,
          })
        );
        const diamondshape = prepareDynamicMessage(
          "shape",
          productList[i].product_diamond_details[k]
        );
        diamondshape?.data.map((t: any) =>
          errors.push({
            head_no: productList[i].head_no,
            shank_no: productList[i].shank_no,
            band_no: productList[i].band_no,
            error_message: t.error_message,
          })
        );
      }

      
      // const diamondClarity = prepareDynamicMessage("clarity", productList[i].product_diamond_details[k])
      // diamondClarity?.data.map((t: any) => errors.push({
      //   product_name: productList[i].name,
      //   product_sku: productList[i].sku,
      //   error_message: t.error_message
      // }))
      // const diamondCarat = prepareDynamicMessage("carat", productList[i].product_diamond_details[k])
      // diamondCarat?.data.map((t: any) => errors.push({
      //   product_name: productList[i].product_name,
      //   product_sku: productList[i].sku,
      //   error_message: t.error_message
      // }))


      let diamondGroupMaster
      if( productList[i].product_diamond_details[k].prod_type.toLocaleLowerCase().trim() != "side") {
         diamondGroupMaster = diamondGroupMasterList.find((item) => {
          return (
            // Check the `min_carat_range` and `max_carat_range` conditions
            item.dataValues.min_carat_range <=
              productList[i].product_diamond_details[k].carat &&
            item.dataValues.max_carat_range >=
              productList[i].product_diamond_details[k].carat &&
            // Check each of the other conditions with a fallback to null
            item.dataValues.id_stone ===
              (productList[i].product_diamond_details[k].stone || null) &&
            item.dataValues.id_shape ===
              (productList[i].product_diamond_details[k].shape || null) &&
            item.dataValues.id_color ===
              (productList[i].product_diamond_details[k].color || null) &&
            item.dataValues.id_clarity ===
              (productList[i].product_diamond_details[k].clarity || null) &&
            item.dataValues.id_cuts ===
              (productList[i].product_diamond_details[k].cut || null)
          );
        });
      } else {

        const caratSize = await getIdFromName(
          productList[i].product_diamond_details[k].carat,
          diamondSizeList,
          "value"
        )

        diamondGroupMaster = diamondGroupMasterList.find((item) => {
          return (
            item.dataValues.id_carat ==
            caratSize &&
            // Check each of the other conditions with a fallback to null
            item.dataValues.id_stone ===
              (productList[i].product_diamond_details[k].stone || null) &&
            item.dataValues.id_shape ===
              (productList[i].product_diamond_details[k].shape || null) &&
            item.dataValues.id_color ===
              (productList[i].product_diamond_details[k].color || null) &&
            item.dataValues.id_clarity ===
              (productList[i].product_diamond_details[k].clarity || null) &&
            item.dataValues.id_cuts ===
              (productList[i].product_diamond_details[k].cut || null)
          );
        });
      }
      

      //Check diamondGroupMaster is null or not
      //If null need to throw error

      // if (productList[i].product_type.toLocaleLowerCase() == 'ring' && diamondGroupMaster == null && productList[i].product_diamond_details[k].stone_cost != null) {
      //   const diamondGroupMasterCreate:any = await  DiamondGroupMaster.create({
      //     id_stone: productList[i].product_diamond_details[k].stone,
      //     id_shape: productList[i].product_diamond_details[k].shape,
      //     id_mm_size: productList[i].product_diamond_details[k].mm_size,
      //     id_color: productList[i].product_diamond_details[k].color,
      //     id_clarity: productList[i].product_diamond_details[k].clarity,
      //     id_cuts: productList[i].product_diamond_details[k].cut,
      //     id_carat: productList[i].product_diamond_details[k].carat,
      //     rate: productList[i].product_diamond_details[k].stone_cost,
      //     created_date: getLocalDate(),
      //     is_active: ActiveStatus.Active,
      //     is_deleted: DeletedStatus.No,
      //   })

      // productList[i].product_diamond_details[k].product_dia_group = diamondGroupMasterCreate?.id;
      // } else
      if (diamondGroupMaster == null) {

        errors.push({
          head_no: productList[i].head_no,
          shank_no: productList[i].shank_no,
          band_no: productList[i].band_no,
          error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
            ["field_name", "product diamond group"],
          ]),
        });
      } else {
        productList[i].product_diamond_details[k].product_dia_group =
          diamondGroupMaster?.dataValues.id;
      }

      // productList[i].product_diamond_details[k].product_dia_group = diamondGroupMaster ? diamondGroupMaster?.dataValues.id : null;
    }
  }
  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};

const getPipedIdFromFieldValue = async (
  model: any,
  fieldValue: string,
  fieldName: string,
  client_id:number
) => {
  if (fieldValue == null || fieldValue === "") {
    return "";
  }
  let valueList = fieldValue.toString().toLocaleLowerCase().split("|");

  let findData = await model.findAll({
    where: {
      [fieldName]: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col(`${[fieldName]}`)),
        { [Op.in]: valueList }
      ),
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      company_info_id:client_id,
    },
  });
  let idList = [];
  for (const tag of findData) {
    tag && idList.push(tag.dataValues.id);
  }
  return idList.join("|");
};

const prepareDynamicMessage = (fieldName: string, value: any) => {
  let errors: {
    row_id: number;
    error_message: string;
  }[] = [];

  let arrFields = ["shape", "stone"];
  arrFields = arrFields.filter((t) => t != fieldName);

  arrFields.forEach((t) => {
    if (value[t] == null) {
      errors.push({
        row_id: 1,
        error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
          ["field_name", t],
        ]),
      });
    }
  });
  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
};

const addProductToDB = async (productList: any, idAppUser: number, client_id: number, req: Request) => {
  const {ShanksData,HeadsData, SideSettingStyles, DiamondShape, DiamondCaratSize, StoneData, MMSizeData, Colors, ClarityData, CutsData, MetalMaster, GoldKarat,ConfigProductDiamonds,ConfigProductMetals,ConfigProduct} = initModels(req);
  const trn = await req.body.db_connection.transaction();
  let activitylogs: any = {}
  let resProduct,
    productMetalData,
    productDiamondData,
    prodMetalPayload: any = [],
    productDiamondPayload: any = [];
  const where = {
    is_deleted: DeletedStatus.No,
    is_active: ActiveStatus.Active,
    company_info_id:client_id,
  };
  try {
    const shankList = await ShanksData.findAll({ where });
    const headList = await HeadsData.findAll({ where });
    const sideSettingList = await SideSettingStyles.findAll({ where });
    const stoneList = await StoneData.findAll({ where });
    const diamondShapeList = await DiamondShape.findAll({ where });
    const diamondSizeList = await DiamondCaratSize.findAll({ where });
    const colorList = await Colors.findAll({ where });
    const clarityList = await ClarityData.findAll({ where });
    const cutsList = await CutsData.findAll({ where });
    const metalList = await MetalMaster.findAll({ where });
    const karatList = await GoldKarat.findAll({ where });
    for (const product of productList) {
      let shank = await getValueFromId(
        shankList,
        product.shak_type,
        "id",
        "sort_code"
      );
      let setting = await getValueFromId(
        sideSettingList,
        product.setting_type,
        "id",
        "sort_code"
      );
      let head = await getValueFromId(
        headList,
        product.head_type,
        "id",
        "sort_code"
      );
      let centerStone = await getValueFromId(
        stoneList,
        product.center_stone,
        "id",
        "sort_code"
      );
      let centerStoneName = await getValueFromId(
        stoneList,
        product.center_stone,
        "id",
        "name"
      );
      let diamondShape = await getValueFromId(
        diamondShapeList,
        product.center_dia_shape,
        "id",
        "sort_code"
      );
      let metal = await getValueFromId(
        metalList,
        product.product_metal_data[0].metal,
        "id",
        "name"
      );
      let karat = await getValueFromId(
        karatList,
        product.product_metal_data[0].karat,
        "id",
        "name"
      );
      let carat = await getValueFromId(
        diamondSizeList,
        product.center_dia_carat,
        "id",
        "value"
      );
      let diamondShapeName = await getValueFromId(
        diamondShapeList,
        product.center_dia_shape,
        "id",
        "name"
      );
      let shankName = await getValueFromId(
        shankList,
        product.shak_type,
        "id",
        "name"
      );
      let settingName = await getValueFromId(
        sideSettingList,
        product.setting_type,
        "id",
        "name"
      );
      let headName = await getValueFromId(
        headList,
        product.head_type,
        "id",
        "name"
      );
      let clarity = await getValueFromId(
        clarityList,
        product.center_dia_clarity,
        "id",
        "slug"
      );
      let cut = await getValueFromId(
        cutsList,
        product.center_dia_cut,
        "id",
        "slug"
      );
      let color = await getValueFromId(
        colorList,
        product.center_dia_color,
        "id",
        "value"
      );
      let sku = karat
        ? `${shank}-${setting}-${head}-${
            product.center_dia_type == DIAMOND_TYPE.natural
              ? "natural"
              : "lab-grown"
          }-${centerStone}-${diamondShape}-${carat}${
            clarity && color ? `-${color}-${clarity}` : `${cut}`
          }-${metal}-${karat}KT`
        : `${shank}-${setting}-${head}-${
            product.center_dia_type == DIAMOND_TYPE.natural
              ? "natural"
              : "lab-grown"
          }-${centerStone}-${diamondShape}-${carat}${
            clarity && color ? `-${color}-${clarity}` : `${cut}`
          }-${metal}`;
      const product_name: any = karat
        ? `${karat}ct ${diamondShapeName} ${carat}Carat ${
            clarity && color ? `${color} ${clarity}` : `${cut}`
          } clarity ${shankName} ${settingName} ${headName} -${
            product.center_dia_type == DIAMOND_TYPE.natural
              ? "natural"
              : "lab-grown"
          } ${centerStoneName} Ring`
        : `${metal} ${diamondShapeName} ${carat} Carat ${
            clarity && color ? `${color} ${clarity}` : `${cut}`
          } clarity ${shankName} ${settingName} ${headName} -${
            product.center_dia_type == DIAMOND_TYPE.natural
              ? "natural"
              : "lab-grown"
          } ${centerStoneName} Ring`;
      let slug = product_name
        .toLocaleLowerCase()
        .replaceAll(" ", "-")
        .replaceAll(/['/|]/g, "-");

      const sameSlugCount = await ConfigProduct.count({
        where: [
          columnValueLowerCase("slug", slug),
          { is_deleted: DeletedStatus.No },
        ],
        transaction: trn,
      });

      if (sameSlugCount > 0) {
        slug = `${slug}-${sameSlugCount}`;
      }
  
      resProduct = await ConfigProduct.create(
        {
          product_type: product.product_type,
          product_style: product.product_style,
          product_total_diamond: product.product_total_diamond,
          shank_type_id: product.shak_type,
          side_setting_id: product.setting_type,
          head_type_id: product.head_type,
          style_no: product.style_no,
          style_no_wb: product.style_no_wb,
          head_no: product.head_no,
          shank_no: product.shank_no,
          band_no: product.band_no,
          ring_no: product.ring_no,
          product_title: product_name,
          product_sort_des: product_name,
          product_long_des: product_name,
          sku: sku,
          center_dia_type: product.center_dia_type,
          center_diamond_group_id: product.center_dia_group,
          center_diamond_weigth: null,
          center_dia_cts: product.center_dia_carat
            ? product.center_dia_carat
            : null,
          center_dia_shape_id: product.center_dia_shape
            ? product.center_dia_shape
            : null,
          center_dia_clarity_id: product.center_dia_clarity
            ? product.center_dia_clarity
            : null,
          center_dia_cut_id: product.center_dia_cut
            ? product.center_dia_cut
            : null,
          // center_dia_mm_id: product.center_dia_mm_size ? product.center_dia_mm_size : null,
          center_dia_color: product.center_dia_color
            ? product.center_dia_color
            : null,
          slug: slug,
          laber_charge: 0,
          other_changes: product.other_charge
            ? parseFloat(product.other_charge)
            : 0,
          created_by: idAppUser,
          is_deleted: DeletedStatus.No,
          created_date: getLocalDate(),
          file_type: CONFIG_PRODUCT_IMPORT_FILE_TYPE.AllConfigProduct,
          company_info_id:client_id
        },
        { transaction: trn }
      );

      activitylogs = { ...resProduct?.dataValues}

      for (productMetalData of product.product_metal_data) {
        prodMetalPayload.push({
          config_product_id: resProduct.dataValues.id,
          metal_id: productMetalData.metal,
          karat_id: productMetalData.karat && productMetalData.karat,
          metal_tone: productMetalData.metal_tone,
          metal_wt: productMetalData.metal_weight,
          head_shank_band: productMetalData.head_shank,
          labor_charge: productMetalData.labor_charge,
          created_date: getLocalDate(),
          created_by: idAppUser,
          company_info_id:client_id,
        });
      }

      for (productDiamondData of product.product_diamond_details) {
        productDiamondPayload.push({
          config_product_id: resProduct.dataValues.id,
          product_type: productDiamondData.prod_type,
          id_diamond_group: productDiamondData.product_dia_group,
          dia_weight: productDiamondData.carat
            ? productDiamondData.carat
            : null,
          dia_count: productDiamondData.stone_count,
          created_by: idAppUser,
          created_date: getLocalDate(),
          dia_cts_individual: null,
          dia_size: null,
          dia_shape: productDiamondData.shape,
          dia_stone: productDiamondData.stone,
          dia_color: productDiamondData.color,
          dia_mm_size: productDiamondData.mm_size,
          dia_clarity: productDiamondData.clarity,
          dia_cuts: productDiamondData.cut,
          company_info_id:client_id,
        });
      }
    }

    const ConfigProductDiamondsData = await ConfigProductDiamonds.bulkCreate(productDiamondPayload, {
      transaction: trn,
    });
    const ConfigProductMetalsData = await ConfigProductMetals.bulkCreate(prodMetalPayload, {
      transaction: trn,
    });

    activitylogs = {...activitylogs,Metal:ConfigProductMetalsData.map((t)=>t.dataValues),diamonds:ConfigProductDiamondsData.map((t)=>t.dataValues)}
    await addActivityLogs(req,client_id,[{
      old_data: null,
      new_data: activitylogs}], resProduct?.dataValues?.id, LogsActivityType.Add, LogsType.ConfigAllProductBulkUpload, idAppUser,trn)
   
    await trn.commit();
    await refreshMaterializedRingThreeStoneConfiguratorPriceFindView;
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    return resUnknownError({ data: e });
    throw e;
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
  let findData = await model.findOne({
    where: {
      [fieldName]: fieldValue,
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
    },
  });

  return findData ? findData.dataValues[returnValue] : null;
};

/* ------------------ config product delete --------------- */

export const configProductDeleteApi = async (req: Request) => {
  const {ConfigProduct,ConfigProductMetals,ConfigProductDiamonds,ProductWish, CartProducts} = initModels(req);
  const trn = await req.body.db_connection.transaction();
  try {
    const { id_product } = req.body;
    const productToBeDelete = await ConfigProduct.findOne({
      where: {
        id: id_product,
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
    });

    if (!(productToBeDelete && productToBeDelete.dataValues)) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    await ConfigProduct.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      { where: { id: productToBeDelete.dataValues.id,company_info_id :req?.body?.session_res?.client_id }, transaction: trn }
    );

    await ConfigProductMetals.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: { config_product_id: productToBeDelete.dataValues.id,company_info_id :req?.body?.session_res?.client_id },
        transaction: trn,
      }
    );

    await ConfigProductDiamonds.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: { config_product_id: productToBeDelete.dataValues.id,company_info_id :req?.body?.session_res?.client_id },
        transaction: trn,
      }
    );
    const findProductWish = await ProductWish.findAll({
      where: {
        product_id: productToBeDelete.dataValues.id,
        product_type: [
          AllProductTypes.Config_Ring_product,
          AllProductTypes.Three_stone_config_product,
        ],
      },
    });
    await ProductWish.destroy({
      where: {
        product_id: productToBeDelete.dataValues.id,
        product_type: [
          AllProductTypes.Config_Ring_product,
          AllProductTypes.Three_stone_config_product,
        ],
        company_info_id :req?.body?.session_res?.client_id
      },
      transaction: trn,
    });
    const findCartProducts = await CartProducts.findAll({
      where: {
        product_id: productToBeDelete.dataValues.id,
        product_type: [
          AllProductTypes.Config_Ring_product,
          AllProductTypes.Three_stone_config_product,
        ],
      },
    });  
    await CartProducts.destroy({
      where: {
        product_id: productToBeDelete.dataValues.id,
        product_type: [
          AllProductTypes.Config_Ring_product,
          AllProductTypes.Three_stone_config_product,
        ],
        company_info_id :req?.body?.session_res?.client_id
      },
      transaction: trn,
    });
    await addActivityLogs(req,req?.body?.session_res?.client_id,[{
          old_data: { config_all_product_id: productToBeDelete?.dataValues?.id, data: {...productToBeDelete?.dataValues},findProductWishdata: findProductWish.map((t: any) => t.dataValues),
          findCartProducts: findCartProducts.map((t: any) => t.dataValues)},
          new_data: {
            config_all_product_id: productToBeDelete?.dataValues?.id, data: {
              ...productToBeDelete?.dataValues, is_deleted: DeletedStatus.yes,
              modified_by: req?.body?.session_res?.id_app_user,
              modified_date: getLocalDate(),
            },
            findProductWishdata: null,
            findCartProducts: null
          }
        }], productToBeDelete?.dataValues?.id, LogsActivityType.Delete, LogsType.ConfigAllProductBulkUpload, req?.body?.session_res?.id_app_user,trn)
    await trn.commit();
    return resSuccess({ data: productToBeDelete });
  } catch (e) {
    await trn.rollback();
    return resUnknownError({ data: e });
  }
};
