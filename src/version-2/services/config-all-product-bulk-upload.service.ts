import { Request } from "express";
import {
  columnValueLowerCase,
  getLocalDate,
  prepareMessageFromParams,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../utils/shared-functions";
import {
  DATA_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  FILE_NOT_FOUND,
  GEMSTONE_LIST_INVALID,
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
import ProductBulkUploadFile from "../model/product-bulk-upload-file.model";
import {
  ActiveStatus,
  CONFIG_PRODUCT_IMPORT_FILE_TYPE,
  DeletedStatus,
  DIAMOND_TYPE,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
} from "../../utils/app-enumeration";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import ShanksData from "../model/master/attributes/shanks.model";
import SideSettingStyles from "../model/master/attributes/side-setting-styles.model";
import HeadsData from "../model/master/attributes/heads.model";
import { Op, Sequelize } from "sequelize";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import StoneData from "../model/master/attributes/gemstones.model";
import Colors from "../model/master/attributes/colors.model";
import MMSizeData from "../model/master/attributes/mmSize.model";
import ClarityData from "../model/master/attributes/clarity.model";
import DiamondCaratSize from "../model/master/attributes/caratSize.model";
import CutsData from "../model/master/attributes/cuts.model";
import DiamondGroupMaster from "../model/master/attributes/diamond-group-master.model";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import MetalTone from "../model/master/attributes/metal/metalTone.model";
import ConfigProduct from "../model/config-product.model";
import ConfigProductDiamonds from "../model/config-product-diamonds.model";
import ConfigProductMetals from "../model/config-product-metal.model";
import dbContext from "../../config/db-context";
const readXlsxFile = require("read-excel-file/node");

export const addAllConfigProductsFromNewCSVFile = async (req: Request) => {
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

    //   if (resRows.data.batchSize > PRODUCT_BULK_UPLOAD_BATCH_SIZE) {
    //     return resUnprocessableEntity({
    //       message: PRODCUT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
    //     });
    //   }

    const resProducts = await getProductsFromRows(resRows.data.results);
    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addProductToDB(resProducts.data, idAppUser);
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

const getProductsFromRows = async (rows: any) => {
  let currentProductIndex = -1;
  let productList: any = [];
  let centerDiamondColorClarity;
  let where = { is_active: "1", is_deleted: "0" };
  try {
    let errors: {
      head_no: any;
      shank_no: any;
      band_no: any;
      error_message: string;
    }[] = [];
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
          await ShanksData.findAll({ where }),
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
          await SideSettingStyles.findAll({ where }),
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
        const head_type = await getIdFromName(
          row.head_type,
          await HeadsData.findAll({ where }),
          "name"
        );
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

    const metalProductList = await setMetalProductList(productList);

    const centerDiamondList = await setCenterDiamondProductList(
      metalProductList
    );

    centerDiamondColorClarity = await setCenterDiamondColorAndClaritySet(
      centerDiamondList
    );

    const resCDO: any = await setCenterDiamondGroupMaster(
      centerDiamondColorClarity
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

    const resSMO = await setProductMetalDetails(centerDiamondColorClarity);

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

    const resSDO = await setDiamondOptions(productList);

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

const addProductDetailsToProductList = async (
  row: any,
  productList: any,
  currentProductIndex: number
) => {
  if (productList[currentProductIndex]) {
    if (row.side_dia_prod_type && row.side_dia_prod_type !== "") {
      productList[currentProductIndex].product_diamond_details.push({
        prod_type: row.side_dia_prod_type,
        shape: await getPipedIdFromField(
          DiamondShape,
          row.product_dia_shape,
          "name"
        ),
        stone: await getPipedIdFromField(
          StoneData,
          row.product_dia_type,
          "name"
        ),
        color: row.product_dia_color
          ? await getPipedIdFromField(Colors, row.product_dia_color, "value")
          : null,
        mm_size: row.product_dia_mm_size
          ? await getPipedIdFromField(
              MMSizeData,
              row.product_dia_mm_size.toString(),
              "value"
            )
          : null,
        clarity: row.product_dia_clarity
          ? await getPipedIdFromField(
              ClarityData,
              row.product_dia_clarity,
              "value"
            )
          : null,
        carat: row.product_dia_carat,
        cut: row.product_dia_cut
          ? await getPipedIdFromField(CutsData, row.product_dia_cut, "value")
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
      is_deleted: "0",
      is_active: "1",
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

const setCenterDiamondProductList = async (productList: any) => {
  try {
    let where = { is_active: "1", is_deleted: "0" };
    let productData = [];
    const gemstoneList = await StoneData.findAll({ where });
    const diamondShapeList = await DiamondShape.findAll({ where });
    const caratSizeList = await DiamondCaratSize.findAll({ where });
    const mmSizeList = await MMSizeData.findAll({ where });
    for (let index = 0; index < productList.length; index++) {
      const element: any[] = productList[index].Product_center_diamond_details;

      if (element.length > 0) {
        for (let j = 0; j < element.length; j++) {
          productData.push({
            ...productList[index],
            center_stone: await getIdFromName(
              element[j].center_stone,
              gemstoneList,
              "sort_code"
            ),
            center_dia_shape: await getIdFromName(
              element[j].center_dia_shape,
              diamondShapeList,
              "name"
            ),
            center_dia_carat: await getIdFromName(
              element[j].center_dia_carat,
              caratSizeList,
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

const setCenterDiamondColorAndClaritySet = async (productList: any) => {
  try {
    let productData = [];
    let where = { is_active: "1", is_deleted: "0" };
    const diamondColorList = await Colors.findAll({ where });
    const diamondClarityList = await ClarityData.findAll({ where });
    const gemstoneCutList = await CutsData.findAll({ where });
    for (let index = 0; index < productList.length; index++) {
      if (productList[index].center_dia_color) {
        for (let j = 0; j < productList[index].center_dia_color.length; j++) {
          const color = productList[index].center_dia_color[j];
          const clarity = productList[index].center_dia_clarity[j];
          productData.push({
            ...productList[index],
            center_dia_color: await getIdFromName(
              color,
              diamondColorList,
              "value"
            ),
            center_dia_clarity: await getIdFromName(
              clarity,
              diamondClarityList,
              "value"
            ),
          });
        }
      } else if (productList[index].center_dia_cut) {
        for (let j = 0; j < productList[index].center_dia_cut.length; j++) {
          const cut = productList[index].center_dia_cut[j];
          productData.push({
            ...productList[index],
            center_dia_cut: await getIdFromName(cut, gemstoneCutList, "value"),
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

const setCenterDiamondGroupMaster = async (productList: any) => {
  let length = productList.length,
    i: any;
  let errors: {
    head_no: any;
    shank_no: any;
    band_no: any;
    error_message: string;
  }[] = [];

  for (i = 0; i < length; i++) {
    const diamondGroupMaster: any = await DiamondGroupMaster.findOne({
      where: {
        id_stone: productList[i].center_stone
          ? productList[i].center_stone
          : null,
        id_shape: productList[i].center_dia_shape
          ? productList[i].center_dia_shape
          : null,
        // id_mm_size: productList[i].center_dia_mm_size ? productList[i].center_dia_mm_size : null,
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

const setProductMetalDetails = async (productList: any) => {
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

  const metalList = await MetalMaster.findAll({
    where: {
      name: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("name")), {
        [Op.in]: configMetalNameList,
      }),
      is_deleted: "0",
      is_active: "1",
    },
  });
  const karatList = await GoldKarat.findAll({
    where: {
      name: { [Op.in]: configKaratNameList },
      is_deleted: "0",
      is_active: "1",
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
          "sort_code"
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

const setDiamondOptions = async (productList: any) => {
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

      const diamondGroupMaster = await DiamondGroupMaster.findOne({
        where: {
          [Op.and]: [
            {
              min_carat_range: {
                [Op.lte]: productList[i].product_diamond_details[k].carat,
              },
            },
            {
              max_carat_range: {
                [Op.gte]: productList[i].product_diamond_details[k].carat,
              },
            },
          ],
          id_stone: productList[i].product_diamond_details[k].stone
            ? productList[i].product_diamond_details[k].stone
            : null,
          id_shape: productList[i].product_diamond_details[k].shape
            ? productList[i].product_diamond_details[k].shape
            : null,
          // id_mm_size: productList[i].product_diamond_details[k].mm_size ? productList[i].product_diamond_details[k].mm_size : null,
          id_color: productList[i].product_diamond_details[k].color
            ? productList[i].product_diamond_details[k].color
            : null,
          id_clarity: productList[i].product_diamond_details[k].clarity
            ? productList[i].product_diamond_details[k].clarity
            : null,
          // id_carat: productList[i].product_diamond_details[k].carat ? productList[i].product_diamond_details[k].carat : null,
          id_cuts: productList[i].product_diamond_details[k].cut
            ? productList[i].product_diamond_details[k].cut
            : null,
        },
      });

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
      //     is_deleted: "0",
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
  fieldName: string
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
      is_deleted: "0",
      is_active: "1",
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

const addProductToDB = async (productList: any, idAppUser: number) => {
  const trn = await dbContext.transaction();
  let resProduct,
    productMetalData,
    productDiamondData,
    prodMetalPayload: any = [],
    productDiamondPayload: any = [];

  try {
    for (const product of productList) {
      let shank = await getPipedShortCodeFromField(
        ShanksData,
        product.shak_type,
        "id",
        "sort_code"
      );
      let setting = await getPipedShortCodeFromField(
        SideSettingStyles,
        product.setting_type,
        "id",
        "sort_code"
      );
      let head = await getPipedShortCodeFromField(
        HeadsData,
        product.head_type,
        "id",
        "sort_code"
      );
      let centerStone = await getPipedShortCodeFromField(
        StoneData,
        product.center_stone,
        "id",
        "sort_code"
      );
      let centerStoneName = await getPipedShortCodeFromField(
        StoneData,
        product.center_stone,
        "id",
        "name"
      );
      let diamondShape = await getPipedShortCodeFromField(
        DiamondShape,
        product.center_dia_shape,
        "id",
        "sort_code"
      );
      let metal = await getPipedShortCodeFromField(
        MetalMaster,
        product.product_metal_data[0].metal,
        "id",
        "name"
      );
      let karat = await getPipedShortCodeFromField(
        GoldKarat,
        product.product_metal_data[0].karat,
        "id",
        "name"
      );
      let carat = await getPipedShortCodeFromField(
        DiamondCaratSize,
        product.center_dia_carat,
        "id",
        "value"
      );
      let diamondShapeName = await getPipedShortCodeFromField(
        DiamondShape,
        product.center_dia_shape,
        "id",
        "name"
      );
      let shankName = await getPipedShortCodeFromField(
        ShanksData,
        product.shak_type,
        "id",
        "name"
      );
      let settingName = await getPipedShortCodeFromField(
        SideSettingStyles,
        product.setting_type,
        "id",
        "name"
      );
      let headName = await getPipedShortCodeFromField(
        HeadsData,
        product.head_type,
        "id",
        "name"
      );
      let clarity = await getPipedShortCodeFromField(
        ClarityData,
        product.center_dia_clarity,
        "id",
        "slug"
      );
      let cut = await getPipedShortCodeFromField(
        CutsData,
        product.center_dia_cut,
        "id",
        "slug"
      );
      let color = await getPipedShortCodeFromField(
        Colors,
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
      let slug = product_name.toLocaleLowerCase().replaceAll(" ", "-");

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
          is_deleted: "0",
          created_date: getLocalDate(),
          file_type: CONFIG_PRODUCT_IMPORT_FILE_TYPE.AllConfigProduct,
        },
        { transaction: trn }
      );

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
        });
      }

      for (productDiamondData of product.product_diamond_details) {
        //console.log("productDiamondData", productDiamondData)
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
        });
      }
    }

    await ConfigProductDiamonds.bulkCreate(productDiamondPayload, {
      transaction: trn,
    });
    await ConfigProductMetals.bulkCreate(prodMetalPayload, {
      transaction: trn,
    });

    await trn.commit();
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
      is_deleted: "0",
      is_active: "1",
    },
  });

  return findData ? findData.dataValues[returnValue] : null;
};

/* ------------------ config product delete --------------- */

export const configProductDeleteApi = async (req: Request) => {
  const trn = await dbContext.transaction();
  try {
    const { id_product } = req.body;
    const productToBeDelete = await ConfigProduct.findOne({
      where: {
        id: id_product,
        is_deleted: "0",
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
      { where: { id: productToBeDelete.dataValues.id }, transaction: trn }
    );

    await ConfigProductMetals.update(
      {
        is_deleted: DeletedStatus.yes,
        modified_by: req.body.session_res.id_app_user,
        modified_date: getLocalDate(),
      },
      {
        where: { config_product_id: productToBeDelete.dataValues.id },
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
        where: { config_product_id: productToBeDelete.dataValues.id },
        transaction: trn,
      }
    );

    await trn.commit();
    return resSuccess({ data: productToBeDelete });
  } catch (e) {
    await trn.rollback();
    return resUnknownError({ data: e });
  }
};
