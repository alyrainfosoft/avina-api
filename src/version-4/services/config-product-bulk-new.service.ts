import { Request } from "express";
import {
  getCompanyIdBasedOnTheCompanyKey,
  addActivityLogs,
  getLocalDate,
  prepareMessageFromParams,
  refreshMaterializedRingThreeStoneConfiguratorPriceFindView,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../utils/shared-functions";
import {
  DATA_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  FILE_NOT_FOUND,
  INVALID_HEADER,
  PRODUCT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  REQUIRED_ERROR_MESSAGE,
} from "../../utils/app-messages";
import {
  PRODUCT_BULK_UPLOAD_BATCH_SIZE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../config/env.var";
import { moveFileToLocation } from "../../helpers/file.helper";
import {
  ActiveStatus,
  CONFIG_PRODUCT_IMPORT_FILE_TYPE,
  DeletedStatus,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  LogsActivityType,
  LogsType,
} from "../../utils/app-enumeration";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import { Op, Sequelize } from "sequelize";
import { init } from "wtfnode";
import { initModels } from "../model/index.model";

const readXlsxFile = require("read-excel-file/node");

export const addConfigProductsFromNewCSVFile = async (req: Request) => {
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

const getIdFromName = (name: string, list: any, fieldName: string) => {
  if (name == null || name == "") {
    return null;
  }
  console.log("-----=====000000", list);
  let findItem = list.find(
    (item: any) =>
      item.dataValues[fieldName].toString().trim().toLocaleLowerCase() ==
      name.toString().trim().toLocaleLowerCase()
  );
  if (findItem) {
    return findItem.dataValues.id;
  }
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

    if (resRows.data.batchSize > PRODUCT_BULK_UPLOAD_BATCH_SIZE) {
      return resUnprocessableEntity({
        message: PRODUCT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
      });
    }

    const resProducts = await getProductsFromRows(resRows.data.results,clientId, req);
    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addProductToDB(resProducts.data, idAppUser,clientId, req);
    if (resAPTD.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resAPTD;
    }

    return resSuccess({ data: resAPTD.data });
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
              is_parent: row[0],
              shak_type: row[1],
              setting_type: row[2],
              head_type: row[3],
              center_dia_carat: row[4],
              center_dia_shape: row[5],
              center_dia_mm_size: row[6],
              center_natural_dia_clarity_color: row[7],
              center_lab_grown_dia_clarity_color: row[8],
              center_dia_count: row[9],
              natural_garnet: row[10],
              synthetic_garnet: row[11],
              natural_amethyst: row[12],
              synthetic_amethyst: row[13],
              natural_aquamarine: row[14],
              synthetic_aquamarine: row[15],
              natural_emerald: row[16],
              synthetic_emerald: row[17],
              natural_pearl: row[18],
              synthetic_pearl: row[19],
              natural_ruby: row[20],
              synthetic_ruby: row[21],
              natural_peridot: row[22],
              synthetic_peridot: row[23],
              natural_sapphire: row[24],
              synthetic_sapphire: row[25],
              natural_opal: row[26],
              synthetic_opal: row[27],
              natural_citrine: row[28],
              synthetic_citrine: row[29],
              natural_turquoise: row[30],
              synthetic_turquoise: row[31],
              head_no: row[32],
              shank_no: row[33],
              band_no: row[34],
              ring_no: row[35],
              render_folder_name: row[36],
              long_description: row[37],
              short_description: row[38],
              head_shank: row[39],
              KT_9: row[40],
              KT_10: row[41],
              KT_14: row[42],
              KT_18: row[43],
              KT_22: row[44],
              silver: row[45],
              platinum: row[46],
              metal_tone: row[47],
              prod_type: row[48],
              product_dia_type: row[49],
              product_dia_shape: row[50],
              product_dia_mm_size: row[51],
              product_dia_clarity: row[52],
              product_dia_color: row[53],
              product_dia_cut: row[54],
              product_dia_carat: row[55],
              product_dia_count: row[56],
              labour_charge: row[57],
              other_charge: row[58],
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
    "is_parent",
    "shak_type",
    "setting_type",
    "head_type",
    "center_dia_carat",
    "center_dia_shape",
    "center_dia_mm_size",
    "center_natural_dia_clarity_color",
    "center_lab_grown_dia_clarity_color",
    "center_dia_count",
    "natural_garnet",
    "synthetic_garnet",
    "natural_amethyst",
    "synthetic_amethyst",
    "natural_aquamarine",
    "synthetic_aquamarine",
    "natural_emerald",
    "synthetic_emerald",
    "natural_pearl",
    "synthetic_pearl",
    "natural_ruby",
    "synthetic_ruby",
    "natural_peridot",
    "synthetic_peridot",
    "natural_sapphire",
    "synthetic_sapphire",
    "natural_opal",
    "synthetic_opal",
    "natural_citrine",
    "synthetic_citrine",
    "natural_turquoise",
    "synthetic_turquoise",
    "head_no",
    "shank_no",
    "band_no",
    "ring_no",
    "render_folder_name",
    "long_description",
    "short_description",
    "head_shank",
    "KT_9",
    "KT_10",
    "KT_14",
    "KT_18",
    "KT_22",
    "silver",
    "platinum",
    "metal_tone",
    "prod_type",
    "product_dia_type",
    "product_dia_shape",
    "product_dia_mm_size",
    "product_dia_clarity",
    "product_dia_color",
    "product_dia_cut",
    "product_dia_carat",
    "product_dia_count",
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
  const {ShanksData,HeadsData, SideSettingStyles} = initModels(req)
  let productList: any = [];
  let where = { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No,company_info_id:client_id };
  try {
    let errors: {
      product_name: string;
      product_sku: string;
      error_message: string;
    }[] = [];
    for (const row of rows) {
      if (row.is_parent == "1") {
        if (row.shak_type == null) {
          errors.push({
            product_name: row.product_namerow.render_folder_name,
            product_sku: row.render_folder_name,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Shank Type"],
            ]),
          });
        }

        if (row.setting_type == null) {
          errors.push({
            product_name: row.render_folder_name,
            product_sku: row.render_folder_name,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Setting Type"],
            ]),
          });
        }

        if (row.head_type == null) {
          errors.push({
            product_name: row.render_folder_name,
            product_sku: row.render_folder_name,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Head Type"],
            ]),
          });
        }

        const shak_type = await getIdFromName(
          row.shak_type,
          await ShanksData.findAll({ where }),
          "name"
        );

        if (!shak_type || shak_type == undefined || shak_type == "") {
          errors.push({
            product_name: row.render_folder_name,
            product_sku: row.render_folder_name,
            error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
              ["field_name", "shank type"],
            ]),
          });
        }

        const setting_type = await getIdFromName(
          row.setting_type,
          await SideSettingStyles.findAll({ where }),
          "name"
        );

        if (!setting_type || setting_type == undefined || setting_type == "") {
          errors.push({
            product_name: row.render_folder_name,
            product_sku: row.render_folder_name,
            error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
              ["field_name", "setting type"],
            ]),
          });
        }

        const head_type = await getIdFromName(
          row.head_type,
          await HeadsData.findAll({ where }),
          "name"
        );

        if (!head_type || head_type == undefined || head_type == "") {
          errors.push({
            product_name: row.render_folder_name,
            product_sku: row.render_folder_name,
            error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
              ["field_name", "setting type"],
            ]),
          });
        }

        currentProductIndex++;
        productList.push({
          shak_type: shak_type,
          setting_type: setting_type,
          head_type: head_type,
          head_no: row.head_no,
          shank_no: row.shank_no,
          ring_no: row.ring_no,
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
          product_name: row.render_folder_name,
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
          req
        );
      } else if (row.is_parent == "0") {
        await addProductDetailsToProductList(
          row,
          productList,
          currentProductIndex,
          req
        );
      }
    }

    const metalProductList = await setMetalProductList(productList);

    const centerDiamondList = await setCenterDiamondProductList(
      metalProductList,client_id, req
    );

    const centerDiamondColorClarity = await setCenterDiamondColorAndClaritySet(
      centerDiamondList,client_id,req
    );

    const resCDO: any = await setCenterDiamondGroupMaster(
      centerDiamondColorClarity,client_id,req
    );

    if (resCDO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resCDO.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const resSMO = await setProductMetalDetails(centerDiamondColorClarity,client_id,req);

    if (resSMO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSMO.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const resSDO = await setDiamondOptions(productList,client_id,req);

    if (resSDO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSDO.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    if (errors.length > 0) {
      return resUnprocessableEntity({ data: errors });
    }
    return resSuccess({ data: resSMO.data });
  } catch (e) {
    return resUnknownError({ data: e });

    throw e;
  }
};

const addProductDetailsToProductList = async (
  row: any,
  productList: any,
  currentProductIndex: number,
  req: Request
) => {
    const {DiamondShape,StoneData,Colors,MMSizeData,ClarityData,CutsData,DiamondCaratSize} = initModels(req);

  if (productList[currentProductIndex]) {
    if (row.prod_type && row.prod_type !== "") {
      productList[currentProductIndex].product_diamond_details.push({
        prod_type: row.prod_type,
        shape: await getPipedIdFromField(
          DiamondShape,
          row.product_dia_shape,
          "name",
          req
        ),
        stone: await getPipedIdFromField(
          StoneData,
          row.product_dia_type,
          "name",
          req
        ),
        color: row.product_dia_color
          ? await getPipedIdFromField(Colors, row.product_dia_color, "value",req)
          : null,
        mm_size: row.product_dia_mm_size
          ? await getPipedIdFromField(
              MMSizeData,
              row.product_dia_mm_size.toString(),
            "value",
              req
            )
          : null,
        clarity: row.product_dia_clarity
          ? await getPipedIdFromField(
              ClarityData,
              row.product_dia_clarity,
            "value",
              req
            )
          : null,
        carat: row.product_dia_carat
          ? await getPipedIdFromField(
              DiamondCaratSize,
              row.product_dia_carat,
            "value",
              req
            )
          : null,
        cut: row.product_dia_cut
          ? await getPipedIdFromField(
              DiamondCaratSize,
              row.product_dia_cut,
            "value",
              req
            )
          : null,
        stone_count: row.product_dia_count,
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
          labor_charge: null,
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
          labor_charge: null,
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
          labor_charge: null,
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
          labor_charge: null,
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
          labor_charge: null,
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
          labor_charge: null,
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
          labor_charge: null,
        });
      }
    }
    if (
      row.center_natural_dia_clarity_color &&
      row.center_natural_dia_clarity_color !== ""
    ) {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "diamond",
        center_dia_carat: row.center_dia_carat,
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
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: row.center_lab_grown_dia_clarity_color,
        center_dia_cuts: null,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_garnet && row.natural_garnet !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "garnet",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_garnet,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_garnet && row.synthetic_garnet !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "garnet",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_garnet,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_amethyst && row.natural_amethyst !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "amethyst",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_amethyst,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_amethyst && row.synthetic_amethyst !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "amethyst",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_amethyst,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_aquamarine && row.natural_aquamarine !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "aquamarine",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_aquamarine,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_aquamarine && row.synthetic_aquamarine !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "aquamarine",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_aquamarine,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_emerald && row.natural_emerald !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "emerald",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_emerald,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_emerald && row.synthetic_emerald !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "emerald",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_emerald,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_pearl && row.natural_pearl !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "pearl",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_pearl,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_pearl && row.synthetic_pearl !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "pearl",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_pearl,
        center_dia_count: row.center_dia_count,
      });
    }

    if (row.natural_ruby && row.natural_ruby !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "ruby",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_ruby,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_ruby && row.synthetic_ruby !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "ruby",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_ruby,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_peridot && row.natural_peridot !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "peridot",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_peridot,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_peridot && row.synthetic_peridot !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "peridot",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_peridot,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_sapphire && row.natural_sapphire !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "sapphire",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_sapphire,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_sapphire && row.synthetic_sapphire !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "sapphire",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_sapphire,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_opal && row.natural_opal !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "opal",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_opal,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_opal && row.synthetic_opal !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "opal",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_opal,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_citrine && row.natural_citrine !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "citrine",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_citrine,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_citrine && row.synthetic_citrine !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "citrine",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_citrine,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.natural_turquoise && row.natural_turquoise !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "turquoise",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.natural_turquoise,
        center_dia_count: row.center_dia_count,
      });
    }
    if (row.synthetic_turquoise && row.synthetic_turquoise !== "") {
      productList[currentProductIndex].Product_center_diamond_details.push({
        center_stone: "turquoise",
        center_dia_carat: row.center_dia_carat,
        center_dia_shape: row.center_dia_shape,
        center_dia_mm_size: row.center_dia_mm_size,
        center_dia_color_clarity: null,
        center_dia_cuts: row.synthetic_turquoise,
        center_dia_count: row.center_dia_count,
      });
    }
  }
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

const setCenterDiamondProductList = async (productList: any,client_id:any, req: Request) => {
  try {
    let where = { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No, company_info_id:client_id };
    let productData = [];
    const {StoneData, DiamondCaratSize, DiamondShape, MMSizeData} = initModels(req);

    for (let index = 0; index < productList.length; index++) {
      const element: any[] = productList[index].Product_center_diamond_details;
      const jsonObject: string[] = element.map((book) => JSON.stringify(book));
      const uniqueSet: Set<string> = new Set(jsonObject);
      const uniqueArray: any[] = Array.from(uniqueSet).map((str) =>
        JSON.parse(str)
      );

      for (let j = 0; j < uniqueArray.length; j++) {
        productData.push({
          ...productList[index],
          center_stone: await getIdFromName(
            uniqueArray[j].center_stone,
            await StoneData.findAll({ where }),
            "name"
          ),
          center_dia_shape: await getIdFromName(
            uniqueArray[j].center_dia_shape,
            await DiamondShape.findAll({ where }),
            "name"
          ),
          center_dia_carat: await getIdFromName(
            uniqueArray[j].center_dia_carat,
            await DiamondCaratSize.findAll({ where }),
            "value"
          ),
          center_dia_mm_size: await getPipedIdFromField(
            MMSizeData,
            uniqueArray[j].center_dia_mm_size.toString(),
            "value",
            req
          ),
          center_dia_color:
            uniqueArray[j].center_dia_color_clarity &&
            uniqueArray[j].center_dia_color_clarity
              .split(",")
              .map((value: any) => value.split("|")[0]),
          center_dia_clarity:
            uniqueArray[j].center_dia_color_clarity &&
            uniqueArray[j].center_dia_color_clarity
              .split(",")
              .map((value: any) => value.split("|")[1]),
          center_dia_count: uniqueArray[j].center_dia_count,
          center_dia_cut:
            uniqueArray[j].center_dia_cuts &&
            uniqueArray[j].center_dia_cuts.split("|"),
          Product_center_diamond_details: [],
        });
      }
    }

    return productData;
  } catch (error) {
    throw error;
  }
};

const setCenterDiamondColorAndClaritySet = async (productList: any,client_id:any, req: Request) => {
  try {
    let productData = [];
    const {Colors, ClarityData,CutsData} = initModels(req);
    let where = { is_active: ActiveStatus.Active, is_deleted: DeletedStatus.No,company_info_id:client_id };
    for (let index = 0; index < productList.length; index++) {
      if (productList[index].center_dia_color) {
        for (let j = 0; j < productList[index].center_dia_color.length; j++) {
          const color = productList[index].center_dia_color[j];
          const clarity = productList[index].center_dia_clarity[j];
          productData.push({
            ...productList[index],
            center_dia_color: await getIdFromName(
              color,
              await Colors.findAll({ where }),
              "value"
            ),
            center_dia_clarity: await getIdFromName(
              clarity,
              await ClarityData.findAll({ where }),
              "value"
            ),
          });
        }
      } else if (productList[index].center_dia_cut) {
        for (let j = 0; j < productList[index].center_dia_cut.length; j++) {
          const cut = productList[index].center_dia_cut[j];
          productData.push({
            ...productList[index],
            center_dia_cut: await getIdFromName(
              cut,
              await CutsData.findAll({ where }),
              "value"
            ),
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

const setProductMetalDetails = async (productList: any,client_id:any, req: Request) => {
  let configMetalNameList = [],
    configKaratNameList = [],
    pmo;
  let productData = [];
  let errors: {
    product_name: string;
    product_sku: string;
    error_message: string;
  }[] = [];
  const {MetalMaster, GoldKarat,MetalTone} = initModels(req);
  for (let product of productList) {
    for (pmo of product.product_metal_data) {
      pmo.metal &&
        configMetalNameList.push(pmo.metal.toString().toLocaleLowerCase());
      pmo.karat && configKaratNameList.push(pmo.karat);
    }
  }

  const metalList = await MetalMaster.findAll({
    where: {
      name: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("name")), {
        [Op.in]: configMetalNameList,
      }),
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      company_info_id:client_id,
    },
  });
  const karatList = await GoldKarat.findAll({
    where: {
      name: { [Op.in]: configKaratNameList },
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      company_info_id:client_id
    },
  });

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
          client_id,
          req
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

const setDiamondOptions = async (productList: any,client_id:any, req: Request) => {
  let configGroupNameList = [],
    configStoneSettingList = [],
    pmo,
    length = productList.length,
    i: any,
    k,
    pmoLength = 0;
  let errors: {
    product_name: string;
    product_sku: string;
    error_message: string;
  }[] = [];
  let stoneTypeList: any[] = [];
  const {DiamondGroupMaster} = initModels(req);
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
      const diamondStone = prepareDynamicMessage(
        "stone",
        productList[i].product_diamond_details[k]
      );
      diamondStone?.data.map((t: any) =>
        errors.push({
          product_name: productList[i].product_name,
          product_sku: productList[i].sku,
          error_message: t.error_message,
        })
      );
      const diamondshape = prepareDynamicMessage(
        "shape",
        productList[i].product_diamond_details[k]
      );
      diamondshape?.data.map((t: any) =>
        errors.push({
          product_name: productList[i].product_name,
          product_sku: productList[i].sku,
          error_message: t.error_message,
        })
      );

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

      const diamondGroupMaster = await DiamondGroupMaster.findOne({
        where: {
          company_info_id:client_id,
          id_stone: productList[i].product_diamond_details[k].stone
            ? productList[i].product_diamond_details[k].stone
            : null,
          id_shape: productList[i].product_diamond_details[k].shape
            ? productList[i].product_diamond_details[k].shape
            : null,
          id_mm_size: productList[i].product_diamond_details[k].mm_size
            ? productList[i].product_diamond_details[k].mm_size
            : null,
          id_color: productList[i].product_diamond_details[k].color
            ? productList[i].product_diamond_details[k].color
            : null,
          id_clarity: productList[i].product_diamond_details[k].clarity
            ? productList[i].product_diamond_details[k].clarity
            : null,
          id_carat: productList[i].product_diamond_details[k].carat
            ? productList[i].product_diamond_details[k].carat
            : null,
          id_cuts: productList[i].product_diamond_details[k].cut
            ? productList[i].product_diamond_details[k].cut
            : null,
        },
      });

      //Check diamondGroupMaster is null or not
      //If null need to throw error

      if (diamondGroupMaster == null) {
        errors.push({
          product_name: productList[i].product_name,
          product_sku: productList[i].sku,
          error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
            ["field_name", "product diamond group"],
          ]),
        });
      } else {
        // if(productList[i].product_diamond_details[k].stone_weight == null) {
        //   errors.push({
        //     product_name: productList[i].name,
        //     product_sku: productList[i].sku,
        //     error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", "Diamond Weight"]])
        //   })
        // }
      }

      productList[i].product_diamond_details[k].product_dia_group =
        diamondGroupMaster?.dataValues.id;
    }
  }
  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
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

const getPipedIdFromField = async (
  model: any,
  fieldValue: string,
  fieldName: string,
  req: Request
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
const getPipedShortCodeFromField = async (
  model: any,
  fieldValue: string,
  fieldName: string,
  returnValue: string,
  client_id: number,
  req: Request
) => {
  if (fieldValue == null || fieldValue === "") {
    return null;
  }
  let findData = await model.findOne({
    where: {
      [fieldName]: fieldValue,
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      company_info_id:client_id,
    },
  });

  return findData ? findData.dataValues[returnValue] : null;
};
const getPipedIdFromFieldValue = async (
  model: any,
  fieldValue: string,
  fieldName: string,
  client_id: number,
  req: Request
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

const setCenterDiamondGroupMaster = async (productList: any,client_id:any, req: Request) => {
  let configGroupNameList = [],
    configStoneSettingList = [],
    pmo,
    length = productList.length,
    i: any,
    k,
    pmoLength = 0;
  let errors: {
    product_name: string;
    product_sku: string;
    error_message: string;
  }[] = [];
  let stoneTypeList: any[] = [];
  const {DiamondGroupMaster} = initModels(req)
  for (i = 0; i < length; i++) {
    const diamondGroupMaster: any = await DiamondGroupMaster.findOne({
      where: {
        company_info_id:client_id,
        id_stone: productList[i].center_stone
          ? productList[i].center_stone
          : null,
        id_shape: productList[i].center_dia_shape
          ? productList[i].center_dia_shape
          : null,
        id_mm_size: productList[i].center_dia_mm_size
          ? productList[i].center_dia_mm_size
          : null,
        id_color: productList[i].center_dia_color
          ? productList[i].center_dia_color
          : null,
        id_clarity: productList[i].center_dia_clarity
          ? productList[i].center_dia_clarity
          : null,
        id_carat: productList[i].center_dia_carat
          ? productList[i].center_dia_carat
          : null,
        id_cuts: productList[i].center_dia_cut
          ? productList[i].center_dia_cut
          : null,
      },
    });

    // if (diamondGroupMaster == null) {
    //   errors.push({
    //     product_name: productList[i].product_name,
    //     product_sku: productList[i].sku,
    //     error_message: prepareMessageFromParams(DATA_NOT_FOUND, [["field_name", "center diamond group"]])
    //   })
    productList[i].center_dia_group =
      diamondGroupMaster != null ? diamondGroupMaster?.dataValues.id : null;

    // }
  }

  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};

const addProductToDB = async (productlList: any, idAppUser: number,client_id:number, req: Request) => {
  const trn = await req.body.db_connection.transaction();
  let activitylogs: any = {}
  let resProduct,
    productMetalData,
    productDiamondData,
    prodMetalPayload: any = [],
    productDiamondPayload: any = [];
  const {ShanksData, SideSettingStyles, HeadsData, StoneData, DiamondShape, ConfigProduct, MetalMaster, GoldKarat, ConfigProductMetals, ConfigProductDiamonds} = initModels(req)
  try {
    for (const product of productlList) {
      let slug = product.product_name.replaceAll(".", "-");
      let shank = await getPipedShortCodeFromField(
        ShanksData,
        product.shak_type,
        "id",
        "sort_code",
        client_id,
        req
      );
      let setting = await getPipedShortCodeFromField(
        SideSettingStyles,
        product.setting_type,
        "id",
        "sort_code",
        client_id,
        req
      );
      let head = await getPipedShortCodeFromField(
        HeadsData,
        product.head_type,
        "id",
        "sort_code",
        client_id,
        req
      );
      let centerStone = await getPipedShortCodeFromField(
        StoneData,
        product.center_stone,
        "id",
        "sort_code",
        client_id,
        req
      );
      let diamondShape = await getPipedShortCodeFromField(
        DiamondShape,
        product.center_dia_shape,
        "id",
        "sort_code",
        client_id,
        req
      );
      let metal = await getPipedShortCodeFromField(
        MetalMaster,
        product.product_metal_data[0].metal,
        "id",
        "name",
        client_id,
        req
      );
      let karat = await getPipedShortCodeFromField(
        GoldKarat,
        product.product_metal_data[0].karat,
        "id",
        "name",
        client_id,
        req
      );
      let sku = karat
        ? `${shank}-${setting}-${head}-${centerStone}-${diamondShape}-${metal}-${karat}KT`
        : `${shank}-${setting}-${head}-${centerStone}-${diamondShape}-${metal}`;

      resProduct = await ConfigProduct.create(
        {
          shank_type_id: product.shak_type,
          side_setting_id: product.setting_type,
          head_type_id: product.head_type,
          head_no: product.head_no,
          shank_no: product.shank_no,
          band_no: product.band_no,
          ring_no: product.ring_no,
          product_title: product.product_name,
          product_sort_des: product.sort_description,
          product_long_des: product.long_description,
          sku: sku,
          center_diamond_group_id: product.center_dia_group,
          slug: slug,
          laber_charge: parseFloat(product.laber_charge),
          other_changes: parseFloat(product.other_charge),
          created_by: idAppUser,
          is_deleted: DeletedStatus.No,
          created_date: getLocalDate(),
          center_dia_cts: product.center_dia_carat,
          center_dia_shape_id: product.center_dia_shape,
          center_dia_clarity_id: product.center_dia_clarity,
          center_dia_cut_id: product.center_dia_cut,
          center_dia_mm_id: product.center_dia_mm_size,
          center_dia_color: product.center_dia_color,
          file_type: CONFIG_PRODUCT_IMPORT_FILE_TYPE.OptimationFile,
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
          company_info_id:client_id
        });
      }

      for (productDiamondData of product.product_diamond_details) {
        productDiamondPayload.push({
          config_product_id: resProduct.dataValues.id,
          product_type: productDiamondData.prod_type,
          id_diamond_group: productDiamondData.product_dia_group,
          dia_count: productDiamondData.stone_count,
          created_by: idAppUser,
          created_date: getLocalDate(),
          dia_cts_individual: null,
          dia_cts: productDiamondData.carat,
          dia_shape: productDiamondData.shape,
          dia_stone: productDiamondData.stone,
          dia_color: productDiamondData.color,
          dia_mm_size: productDiamondData.mm_size,
          dia_clarity: productDiamondData.clarity,
          dia_cuts: productDiamondData.cut,
          company_info_id:client_id
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
      new_data: activitylogs}], resProduct?.dataValues?.id, LogsActivityType.Add, LogsType.ConfigProductBulkUploadNew, idAppUser,trn)
   
    await trn.commit();
    await refreshMaterializedRingThreeStoneConfiguratorPriceFindView;
    return resSuccess({ data: prodMetalPayload });
  } catch (e) {
    await trn.rollback();
    return resUnknownError({ data: e });
    throw e;
  }
};

export const newConfigProductPriceFind = async (req: Request) => {
  try {
    const {
      center_stone,
      center_stone_shape,
      is_band,
      center_stone_size,
      center_stone_cuts,
      center_stone_clarity,
      center_stone_color,
      center_stone_mm_size,
      head,
      shank,
      side_setting,
      metal,
      karat,
    } = req.body;
    const {DiamondGroupMaster,ConfigProduct,ConfigProductMetals} = req.body.db_connection.models;
    const company_info_id = await getCompanyIdBasedOnTheCompanyKey(req?.query,req.body.db_connection);
    if(company_info_id.code !== DEFAULT_STATUS_CODE_SUCCESS){
      return company_info_id;
    }
    const diamond_group = await DiamondGroupMaster.findOne({
      where: {
        id_stone: center_stone,
        id_shape: center_stone_shape,
        id_color: center_stone_color,
        id_clarity: center_stone_clarity,
        id_carat: center_stone_size,
        id_cuts: center_stone_cuts,
        id_mm_size: center_stone_mm_size,
        company_info_id :company_info_id?.data
      },
    });

    const configProduct = await ConfigProduct.findAll({
      where: [
        { center_diamond_group_id: diamond_group?.dataValues.id },
        { head_type_id: head },
        { shank_type_id: shank },
        { side_setting_id: side_setting },
        Sequelize.where(Sequelize.literal('"CPMO"."metal_id"'), "=", metal),
        Sequelize.where(Sequelize.literal('"CPMO"."karat_id"'), "=", karat),
        {company_info_id :company_info_id?.data},
      ],
      attributes: [
        "id",
        "product_title",
        "product_sort_des",
        "product_long_des",
        "sku",
        "head_no",
        "shank_no",
        "band_no",
        "ring_no",
        "center_diamond_group_id",
        [
          Sequelize.literal(
            `(SELECT ((DGM.rate)+laber_charge+other_changes+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/metal_master.calculate_rate*gold_kts.calculate_rate))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${is_band} = 1 THEN  LOWER(CPMO.head_shank_band) <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${is_band} = 1 THEN  LOWER(CPDO.product_type) <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE head_type_id = ${head} AND center_diamond_group_id = ${diamond_group?.dataValues.id}  AND shank_type_id= ${shank} AND side_setting_id= ${side_setting}  AND CASE WHEN product_metal.karat_id IS NULL THEN product_metal.metal_id = ${metal} ELSE product_metal.metal_id = ${metal} AND product_metal.karat_id = ${karat} END)`
          ),
          "product_total_price",
        ],
      ],
      include: [
        {
          required: false,
          model: ConfigProductMetals,
          as: "CPMO",
          attributes: [],
          where:{company_info_id :company_info_id?.data}
        },
      ],
    });

    return resSuccess({ data: configProduct[0] });
  } catch (error) {
    throw error;
  }
};

export const getAllConfigProducts = async (req: Request) => {
  try {
    const {ConfigProduct, ConfigProductMetals, ConfigProductDiamonds} = initModels(req);
    const data = await ConfigProduct.findAll({
      where: {
        is_deleted: DeletedStatus.No,
        company_info_id :req?.body?.session_res?.client_id,
      },
      attributes: [
        "id",
        "head_no",
        "shank_no",
        "band_no",
        "ring_no",
        "render_folder_name",
        "band_render_upload_date",
        "render_upload_date",
        "cad_upload_date",
        "product_title",
        "product_sort_des",
        "product_long_des",
        "sku",
        [
          Sequelize.literal(
            `(SELECT value FROM carat_sizes WHERE id ="center_dia_cts" )`
          ),
          "center_diamond_carat",
        ],
        "center_dia_size",
        [
          Sequelize.literal(
            `(SELECT name FROM diamond_shapes WHERE id ="center_dia_shape_id" )`
          ),
          "center_diamond_shape",
        ],
        [
          Sequelize.literal(
            `(SELECT name FROM clarities WHERE id ="center_dia_clarity_id" )`
          ),
          "center_diamond_clarity",
        ],
        [
          Sequelize.literal(
            `(SELECT value FROM cuts WHERE id ="center_dia_cut_id" )`
          ),
          "center_diamond_cut",
        ],
        [
          Sequelize.literal(
            `(SELECT value FROM mm_sizes WHERE id ="center_dia_mm_id" )`
          ),
          "center_diamond_mm_size",
        ],
        [
          Sequelize.literal(
            `(SELECT name FROM colors WHERE id ="center_dia_color" )`
          ),
          "center_diamond_color",
        ],
        "center_dia_total_count",
        "prod_dia_total_count",
        "prod_dia_total_cts",
        "slug",
        "center_diamond_group_id",
        "laber_charge",
        "center_diamond_weigth",
        "other_changes",
        "product_type",
        "product_style",
        "product_total_diamond",
        "style_no",
        "file_type",
        "retail_price",
        "compare_price",
        "discount_type",
        "discount_value",
        "style_no_wb",
        "center_dia_type",
        [
          Sequelize.literal(
            `(SELECT name FROM heads WHERE id = "head_type_id")`
          ),
          "head_name",
        ],
        [
          Sequelize.literal(
            `(SELECT name FROM shanks WHERE id = "shank_type_id")`
          ),
          "shank_name",
        ],
        [
          Sequelize.literal(
            `(SELECT name FROM side_setting_styles WHERE id = "side_setting_id")`
          ),
          "side_setting_name",
        ],
      ],
      include: [
        {
          required: false,
          model: ConfigProductMetals,
          as: "CPMO",
          where:{company_info_id :req?.body?.session_res?.client_id},
          attributes: [
            "id",
            "config_product_id",
            [
              Sequelize.literal(
                `(SELECT name FROM metal_masters WHERE id = "metal_id")`
              ),
              "metal",
            ],
            [
              Sequelize.literal(
                `(SELECT name FROM gold_kts WHERE id = "karat_id")`
              ),
              "karat",
            ],
            "metal_tone",
            "metal_wt",
            "head_shank_band",
            "labor_charge",
          ],
        },
        {
          required: false,
          model: ConfigProductDiamonds,
          as: "CPDO",
          where:{company_info_id :req?.body?.session_res?.client_id},
          attributes: [
            "id",
            "config_product_id",
            "product_type",
            "dia_cts_individual",
            "dia_count",
            [
              Sequelize.literal(
                `(SELECT value FROM carat_sizes WHERE id ="dia_cts" )`
              ),
              "diamond_carat",
            ],
            [
              Sequelize.literal(
                `(SELECT name FROM diamond_shapes WHERE id ="dia_shape" )`
              ),
              "diamond_shape",
            ],
            [
              Sequelize.literal(
                `(SELECT value FROM mm_sizes WHERE id ="dia_mm_size" )`
              ),
              "diamond_mm_size",
            ],
            [
              Sequelize.literal(
                `(SELECT name FROM colors WHERE id ="dia_color" )`
              ),
              "diamond_color",
            ],
            [
              Sequelize.literal(
                `(SELECT name FROM clarities WHERE id ="dia_clarity" )`
              ),
              "diamond_clarity",
            ],
            [
              Sequelize.literal(
                `(SELECT value FROM cuts WHERE id ="dia_cuts" )`
              ),
              "diamond_cut",
            ],
            "dia_size",
            "id_diamond_group",
            "dia_weight",
            "dia_stone",
          ],
        },
      ],
    });

    return resSuccess({ data: data });
  } catch (error) {
    throw error;
  }
};
