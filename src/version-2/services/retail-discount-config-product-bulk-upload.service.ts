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
  DIAMOND_GROUP_NOT_FOUND,
  FILE_NOT_FOUND,
  INVALID_HEADER,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  PRODUCT_EXIST_WITH_SAME_SKU,
  PRODUCT_NOT_FOUND,
  REQUIRED_ERROR_MESSAGE,
} from "../../utils/app-messages";
import {
  PROCESS_ENVIRONMENT,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../config/env.var";
import { moveFileToLocation } from "../../helpers/file.helper";
import ProductBulkUploadFile from "../model/product-bulk-upload-file.model";
import {
  AllProductTypes,
  CONFIG_PRODUCT_IMPORT_FILE_TYPE,
  DeletedStatus,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
} from "../../utils/app-enumeration";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import ConfigProduct from "../model/config-product.model";
import ShanksData from "../model/master/attributes/shanks.model";
import HeadsData from "../model/master/attributes/heads.model";
import DiamondGroupMaster from "../model/master/attributes/diamond-group-master.model";
import { Op, QueryTypes, Sequelize } from "sequelize";
import StoneData from "../model/master/attributes/gemstones.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import MMSizeData from "../model/master/attributes/mmSize.model";
import Colors from "../model/master/attributes/colors.model";
import ClarityData from "../model/master/attributes/clarity.model";
import CutsData from "../model/master/attributes/cuts.model";
import DiamondCaratSize from "../model/master/attributes/caratSize.model";
import SideSettingStyles from "../model/master/attributes/side-setting-styles.model";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import MetalTone from "../model/master/attributes/metal/metalTone.model";
import ConfigProductDiamonds from "../model/config-product-diamonds.model";
import ConfigProductMetals from "../model/config-product-metal.model";
import dbContext from "../../config/db-context";
import {
  DISCOUNT_TYPE_PLACE_ID,
  DISCOUNT_TYPE_VALUE,
} from "../../utils/app-constants";
const readXlsxFile = require("read-excel-file/node");

export const addRetailConfigProductsFromCSVFile = async (req: Request) => {
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

    const PPBUF = await processRetailProductBulkUploadFile(
      resPBUF.dataValues.id,
      resMFTL.data,
      req.body.session_res.id_app_user
    );

    return PPBUF;
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

const processRetailProductBulkUploadFile = async (
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

    // if (resRows.data.batchSize > PRODUCT_BULK_UPLOAD_BATCH_SIZE) {
    //   return resUnprocessableEntity({
    //     message: PRODCUT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
    //   });
    // }

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
              is_parent: row[0],
              shank_type: row[1],
              setting_type: row[2],
              head_type: row[3],
              center_stone: row[4],
              center_dia_carat: row[5],
              center_dia_shape: row[6],
              center_dia_mm_size: row[7],
              center_dia_color: row[8],
              center_dia_clarity: row[9],
              center_dia_cut: row[10],
              center_dia_count: row[11],
              head_no: row[12],
              shank_no: row[13],
              band_no: row[14],
              ring_no: row[15],
              product_name: row[16],
              short_description: row[17],
              long_description: row[18],
              sku: row[19],
              head_shank: row[20],
              metal: row[21],
              karat: row[22],
              metal_tone: row[23],
              metal_weight: row[24],
              side_dia_prod_type: row[25],
              prod_dia: row[26],
              prod_dia_shape: row[27],
              prod_dia_cut: row[28],
              prod_dia_clarity: row[29],
              prod_dia_color: row[30],
              prod_dia_mm_size: row[31],
              prod_dia_carat: row[32],
              prod_dia_count: row[33],
              laber_charge: row[34],
              other_charge: row[35],
              retail_price: row[36],
              compare_price: row[37],
              discount_type: row[38],
              discount_value: row[39],
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
    "shank_type",
    "setting_type",
    "head_type",
    "center_stone",
    "center_dia_carat",
    "center_dia_shape",
    "center_dia_mm_size",
    "center_dia_color",
    "center_dia_clarity",
    "center_dia_cut",
    "center_dia_count",
    "head_no",
    "shank_no",
    "band_no",
    "ring_no",
    "product_name",
    "short_description",
    "long_description",
    "sku",
    "head_shank",
    "metal",
    "karat",
    "metal_tone",
    "metal_weight",
    "side_dia_prod_type",
    "prod_dia",
    "prod_dia_shape",
    "prod_dia_cut",
    "prod_dia_clarity",
    "prod_dia_color",
    "prod_dia_mm_size",
    "prod_dia_carat",
    "prod_dia_count",
    "laber_charge",
    "other_charge",
    "retail_price",
    "compare_price",
    "discount_type",
    "discount_value",
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
  let where = { is_active: "1", is_deleted: "0" };
  try {
    let errors: {
      product_name: string;
      product_sku: string;
      error_message: string;
    }[] = [];
    for (const row of rows) {
      if (row.is_parent == "1") {
        console.log("----------------------", row);

        //   if(row.product_name == null) {
        //     errors.push({
        //       product_name: row.product_name,
        //       product_sku: row.sku,
        //       error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [["field_name", "Product name"]]),
        //     });
        //   }

        if (row.sku == null) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Product SKU"],
            ]),
          });
        }

        //   const productName = await ConfigProduct.findOne({ where: { name: row.name, is_deleted: "0" } })
        const productsku = await ConfigProduct.findOne({
          where: { sku: row.sku, is_deleted: "0" },
        });

        //   if (productName != null) {
        //     errors.push({
        //       product_name: row.name,
        //       product_sku: row.sku,
        //       error_message: PRODUCT_EXIST_WITH_SAME_NAME,
        //     });
        //   }

        if (productsku != null) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: PRODUCT_EXIST_WITH_SAME_SKU,
          });
        }

        if (row.shank_type == null) {
          errors.push({
            product_name: row.product_name,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Shank Type"],
            ]),
          });
        }

        if (row.setting_type == null) {
          errors.push({
            product_name: row.product_name,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Setting Type"],
            ]),
          });
        }

        if (row.head_type == null) {
          errors.push({
            product_name: row.product_name,
            product_sku: row.sku,
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

        if (!shak_type || shak_type == undefined || shak_type == "") {
          errors.push({
            product_name: row.product_name,
            product_sku: row.sku,
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

        if (setting_type && setting_type == undefined && setting_type == "") {
          errors.push({
            product_name: row.product_name,
            product_sku: row.sku,
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

        if (!head_type && head_type == undefined && head_type == "") {
          errors.push({
            product_name: row.product_name,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
              ["field_name", "head type"],
            ]),
          });
        }

        const diamondGroupMaster = await DiamondGroupMaster.findOne({
          where: {
            id_stone: await getPipedIdFromField(
              StoneData,
              row.center_stone,
              "name"
            ),
            id_shape: await getPipedIdFromField(
              DiamondShape,
              row.center_dia_shape,
              "name"
            ),
            id_mm_size: await getPipedIdFromField(
              MMSizeData,
              row.center_dia_mm_size.toString(),
              "value"
            ),
            id_color: await getPipedIdFromField(
              Colors,
              row.center_dia_color,
              "value"
            ),
            id_clarity: await getPipedIdFromField(
              ClarityData,
              row.center_dia_clarity,
              "value"
            ),
            id_cuts: await getPipedIdFromField(
              CutsData,
              row.center_dia_cut,
              "value"
            ),
            id_carat: await getPipedIdFromField(
              DiamondCaratSize,
              row.center_dia_carat,
              "value"
            ),
          },
        });

        if (diamondGroupMaster == null) {
          errors.push({
            product_name: row.product_name,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
              ["field_name", "center Diamond group"],
            ]),
          });
        }

        currentProductIndex++;
        productList.push({
          shak_type: shak_type,
          setting_type: setting_type,
          head_type: head_type,
          center_diamond_shape: diamondGroupMaster?.dataValues.id_shape,
          center_diamond_stone: diamondGroupMaster?.dataValues.id_stone,
          center_diamond_clarity: diamondGroupMaster?.dataValues.id_clarity,
          center_diamond_cut: diamondGroupMaster?.dataValues.id_cuts,
          center_diamond_color: diamondGroupMaster?.dataValues.id_color,
          center_diamond_mm_size: diamondGroupMaster?.dataValues.id_mm_size,
          center_diamond_carat: diamondGroupMaster?.dataValues.id_carat,
          center_diamond_group_id: diamondGroupMaster?.dataValues.id,
          center_diamond_weight: await getIdFromName(
            row.center_dia_carat,
            await CutsData.findAll({ where }),
            "value"
          ),
          head_no: row.head_no,
          shank_no: row.shank_no,
          ring_no: row.ring_no,
          band_no: row.band_no,
          product_name: row.product_name
            ? row.product_name
            : `${row.center_stone} ${row.center_dia_shape} ${row.center_dia_carat}ct ${row.shank_type} ${row.setting_type} ${row.head_type}`,
          long_description: row.long_description,
          sort_description: row.short_description,
          sku: row.sku,
          laber_charge: row.laber_charge,
          other_charge: row.other_charge,
          retail_price: row.retail_price,
          compare_price: row.compare_price,
          discount_type:
            DISCOUNT_TYPE_PLACE_ID[row.discount_type.toLocaleLowerCase()],
          discount_value: row.discount_value,
          product_metal_details: [],
          product_diamond_details: [],
        });
        addProductDetailsToProductList(row, productList, currentProductIndex);
      } else if (row.is_parent == "0") {
        addProductDetailsToProductList(row, productList, currentProductIndex);
      }
    }

    const resSMO = await setProductMetalDetails(productList);

    if (resSMO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSMO.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const resSDO = await setDiamondOptions(productList);

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
    return resSuccess({ data: productList });
  } catch (e) {
    return resUnknownError({ data: e });
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

const getPipedIdFromField = async (
  model: any,
  fieldValue: string,
  fieldName: string
) => {
  console.log("field-value", fieldValue);
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

const addProductDetailsToProductList = async (
  row: any,
  productList: any,
  currentProductIndex: number
) => {
  if (productList[currentProductIndex]) {
    if (row.side_dia_prod_type && row.side_dia_prod_type !== "") {
      productList[currentProductIndex].product_diamond_details.push({
        prod_type: row.side_dia_prod_type,
        shape: row.prod_dia_shape,
        stone: row.prod_dia,
        color: row.prod_dia_color,
        mm_size: row.prod_dia_mm_size,
        clarity: row.prod_dia_clarity,
        cut: row.prod_dia_cut,
        carat: row.prod_dia_carat,
        stone_count: row.prod_dia_count,
        product_dia_group: null,
      });
    }

    if (row.head_shank && row.head_shank !== "") {
      if (row.head_shank == "band") {
        productList[currentProductIndex].product_metal_details.push({
          head_shank: row.head_shank,
          metal: row.metal,
          karat: row.karat,
          metal_tone: row.metal_tone,
          metal_weight: row.metal_weight,
          labor_charge: row.retail_price,
        });
      } else {
        productList[currentProductIndex].product_metal_details.push({
          head_shank: row.head_shank,
          metal: row.metal,
          karat: row.karat,
          metal_tone: row.metal_tone,
          metal_weight: row.metal_weight,
          labor_charge: null,
        });
      }
    }
  }
};

const setProductMetalDetails = async (productList: any) => {
  let configMetalNameList = [],
    configKaratNameList = [],
    pmo;

  let errors: {
    product_name: string;
    product_sku: string;
    error_message: string;
  }[] = [];

  for (let product of productList) {
    for (pmo of product.product_metal_details) {
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

  for (let product of productList) {
    console.log("product", product);

    for (pmo of product.product_metal_details) {
      console.log("pmo", pmo);
      pmo.metal = getIdFromName(pmo.metal, metalList, "name");
      pmo.karat = getIdFromName(pmo.karat, karatList, "name");
      pmo.metal_tone = await getPipedIdFromFieldValue(
        MetalTone,
        pmo.metal_tone,
        "sort_code"
      );
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

const setDiamondOptions = async (productList: any) => {
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
      const diamondStone = prepareDynamicMessageOneCombination(
        "stone",
        productList[i].product_diamond_details[k]
      );
      diamondStone?.data.map((t: any) =>
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: t.error_message,
        })
      );
      const diamondshape = prepareDynamicMessageOneCombination(
        "shape",
        productList[i].product_diamond_details[k]
      );
      diamondshape?.data.map((t: any) =>
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: t.error_message,
        })
      );
      const diamondMMSize = prepareDynamicMessageOneCombination(
        "mm_size",
        productList[i].product_diamond_details[k]
      );
      diamondMMSize?.data.map((t: any) =>
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: t.error_message,
        })
      );
      // const diamondColor = prepareDynamicMessage("color", productList[i].product_diamond_details[k])
      // diamondColor?.data.map((t: any) => errors.push({
      //   product_name: productList[i].name,
      //   product_sku: productList[i].sku,
      //   error_message: t.error_message
      // }))
      // const diamondCut = prepareDynamicMessage("seive_size", productList[i].product_diamond_details[k])
      // diamondCut?.data.map((t: any) => errors.push({
      //   product_name: productList[i].name,
      //   product_sku: productList[i].sku,
      //   error_message: t.error_message
      // }))
      // const diamondClarity = prepareDynamicMessage("clarity", productList[i].product_diamond_details[k])
      // diamondClarity?.data.map((t: any) => errors.push({
      //   product_name: productList[i].name,
      //   product_sku: productList[i].sku,
      //   error_message: t.error_message
      // }))
      // const diamondCarat = prepareDynamicMessage("carat", productList[i].product_diamond_details[k])
      // diamondCarat?.data.map((t: any) => errors.push({
      //   product_name: productList[i].name,
      //   product_sku: productList[i].sku,
      //   error_message: t.error_message
      // }))

      const diamondGroupMaster = await DiamondGroupMaster.findOne({
        where: {
          id_stone: await getPipedIdFromField(
            StoneData,
            productList[i].product_diamond_details[k].stone,
            "name"
          ),
          id_shape: await getPipedIdFromField(
            DiamondShape,
            productList[i].product_diamond_details[k].shape,
            "name"
          ),
          id_mm_size: await getPipedIdFromField(
            MMSizeData,
            productList[i].product_diamond_details[k].mm_size.toString(),
            "value"
          ),
          id_color: await getPipedIdFromField(
            Colors,
            productList[i].product_diamond_details[k].color,
            "value"
          ),
          id_clarity: await getPipedIdFromField(
            ClarityData,
            productList[i].product_diamond_details[k].clarity,
            "value"
          ),
          id_cuts: await getPipedIdFromField(
            CutsData,
            productList[i].product_diamond_details[k].cut,
            "value"
          ),
          id_carat: await getPipedIdFromField(
            DiamondCaratSize,
            productList[i].product_diamond_details[k].carat,
            "value"
          ),
          is_deleted: "0",
        },
      });

      //Check diamondGroupMaster is null or not
      //If null need to throw error

      if (diamondGroupMaster == null) {
        errors.push({
          product_name: productList[i].name,
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
      (productList[i].product_diamond_details[k].shape =
        diamondGroupMaster?.dataValues.id_shape),
        (productList[i].product_diamond_details[k].stone =
          diamondGroupMaster?.dataValues.id_stone),
        (productList[i].product_diamond_details[k].color =
          diamondGroupMaster?.dataValues.id_color),
        (productList[i].product_diamond_details[k].mm_size =
          diamondGroupMaster?.dataValues.id_mm_size),
        (productList[i].product_diamond_details[k].clarity =
          diamondGroupMaster?.dataValues.id_clarity),
        (productList[i].product_diamond_details[k].cut =
          diamondGroupMaster?.dataValues.id_cuts),
        (productList[i].product_diamond_details[k].carat =
          diamondGroupMaster?.dataValues.id_carat),
        (productList[i].product_diamond_details[k].product_dia_group =
          diamondGroupMaster?.dataValues.id);
    }
  }
  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};

const prepareDynamicMessageOneCombination = (fieldName: string, value: any) => {
  let errors: {
    row_id: number;
    error_message: string;
  }[] = [];

  let arrFields = ["shape", "stone", "mm_size"];
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
        ? `${shank}-${setting}-${head}-${centerStone}-${diamondShape}-${metal}${
            clarity && color ? `-${color}-${clarity}` : `${cut}`
          }-${karat}KT`
        : `${shank}-${setting}-${head}-${centerStone}-${diamondShape}-${metal}${
            clarity && color ? `-${color}-${clarity}` : `${cut}`
          }`;
      const product_name: any = karat
        ? `${karat}ct ${diamondShapeName} ${carat}Carat ${
            clarity && color
              ? ` ${color} color ${clarity} clarity`
              : ` ${cut} cut`
          }  ${shankName} ${settingName} ${headName}  ${centerStoneName} Ring`
        : `${metal} ${diamondShapeName} ${carat} Carat ${
            clarity && color
              ? ` ${color} color ${clarity} clarity`
              : ` ${cut} cut`
          } ${shankName} ${settingName} ${headName}  ${centerStoneName} Ring`;

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
          shank_type_id: product.shak_type,
          side_setting_id: product.setting_type,
          head_type_id: product.head_type,
          head_no: product.head_no,
          shank_no: product.shank_no,
          band_no: product.band_no,
          ring_no: product.ring_no,
          product_title: product_name,
          product_sort_des: product.sort_description,
          product_long_des: product.long_description,
          sku: sku,
          center_diamond_group_id: product.center_diamond_group_id,
          center_dia_cts: product.center_diamond_carat,
          center_dia_shape_id: product.center_diamond_shape,
          center_dia_clarity_id: product.center_diamond_clarity,
          center_dia_cut_id: product.center_diamond_cut,
          center_dia_mm_id: product.center_diamond_mm_size,
          center_dia_color: product.center_diamond_color,
          file_type: CONFIG_PRODUCT_IMPORT_FILE_TYPE.RetailAndDiscount,
          slug: slug,
          laber_charge: parseFloat(product.laber_charge),
          other_changes: parseFloat(product.other_charge),
          retail_price: parseFloat(product.retail_price),
          compare_price: parseFloat(product.compare_price),
          discount_type: product.discount_type,
          discount_value: product.discount_value,
          created_by: idAppUser,
          is_deleted: "0",
          created_date: getLocalDate(),
        },
        { transaction: trn }
      );

      for (productMetalData of product.product_metal_details) {
        prodMetalPayload.push({
          config_product_id: resProduct.dataValues.id,
          metal_id: productMetalData.metal,
          karat_id: productMetalData.karat,
          metal_tone: productMetalData.metal_tone,
          metal_wt: productMetalData.metal_weight,
          head_shank_band: productMetalData.head_shank,
          labor_charge: productMetalData.labor_charge,
          created_date: getLocalDate(),
          created_by: idAppUser,
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

/* price find API */

export const configProductRetailPriceFind = async (req: Request) => {
  try {
    const {
      center_stone,
      diamond_type,
      center_stone_shape,
      is_band,
      center_stone_size,
      center_stone_cuts,
      center_stone_clarity,
      center_stone_color,
      head,
      shank,
      side_setting,
      metal,
      karat,
      id_head_metal_tone,
      id_shank_metal_tone,
      id_band_metal_tone,
      user_id,
    } = req.body;

    if (
      id_head_metal_tone &&
      id_head_metal_tone != undefined &&
      id_head_metal_tone != null &&
      id_head_metal_tone != "undefined" &&
      id_head_metal_tone != "null"
    ) {
      id_head_metal_tone;
    }
    const diamond_group = await DiamondGroupMaster.findOne({
      where: {
        id_stone: center_stone,
        id_shape: center_stone_shape,
        id_color: center_stone_color,
        id_clarity: center_stone_clarity,
        id_carat: center_stone_size ? center_stone_size : null,
        id_cuts: center_stone_cuts,
      },
    });
    if (!diamond_group && diamond_group == null) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }
    console.log("diamond_group", diamond_group.dataValues);

    const configProduct = await ConfigProduct.findAll({
      where: [
        { center_diamond_group_id: diamond_group?.dataValues.id },
        { head_type_id: head },
        { shank_type_id: shank },
        { side_setting_id: side_setting },
        { center_dia_type: diamond_type },
        Sequelize.where(Sequelize.literal('"CPMO"."metal_id"'), "=", metal),
        Sequelize.where(Sequelize.literal('"CPMO"."karat_id"'), "=", karat),
        { is_deleted: "0" },
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
        "discount_type",
        "compare_price",
        "discount_value",
        [
          Sequelize.literal(
            `(SELECT CASE WHEN id IS NULL  THEN NULL ELSE id END FROM wishlist_products WHERE product_id = "config_products"."id" AND product_type = ${
              AllProductTypes.Config_Ring_product
            } AND user_id = ${
              user_id &&
              user_id != undefined &&
              user_id != null &&
              user_id != "undefined" &&
              user_id != "null"
                ? user_id
                : null
            } AND id_shank_metal_tone = ${
              id_shank_metal_tone &&
              id_shank_metal_tone != "null" &&
              id_shank_metal_tone != null &&
              id_shank_metal_tone != undefined &&
              id_shank_metal_tone
                ? id_shank_metal_tone
                : null
            } AND id_head_metal_tone = ${
              id_head_metal_tone &&
              id_head_metal_tone != undefined &&
              id_head_metal_tone != null &&
              id_head_metal_tone != "undefined" &&
              id_head_metal_tone != "null"
                ? id_head_metal_tone
                : null
            }  AND CASE WHEN ${is_band} = 1 THEN id_band_metal_tone = ${
              id_band_metal_tone &&
              id_band_metal_tone != "null" &&
              id_band_metal_tone != null &&
              id_band_metal_tone != undefined &&
              id_band_metal_tone
                ? id_band_metal_tone
                : null
            } ELSE id_band_metal_tone IS NULL END AND is_band = '${is_band}')`
          ),
          "wishlist_id",
        ],
        [
          Sequelize.literal(`CASE WHEN 
          'zamles' = '${PROCESS_ENVIRONMENT}'  THEN  CASE WHEN "file_type" != 3 THEN 
          (SELECT  CASE WHEN ${diamond_type} = 1 THEN 
            ((DGM.rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+
            (product_metal.metal_rate*9.754)+COALESCE(product_diamond.diamond_rate, 0)) 
            ELSE ((DGM.synthetic_rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+
            (product_metal.metal_rate*9.754)+COALESCE(product_diamond.diamond_rate, 0)) END
             FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON 
             config_products.center_diamond_group_id = DGM.id 
             LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , 
              CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN 
              (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) 
              ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  
              END  AS metal_rate FROM config_product_metals AS CPMO 
              LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id 
              LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id 
              WHERE CASE WHEN ${is_band} = 1 THEN  LOWER(CPMO.head_shank_band) <> '' 
              ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, 
              CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) 
              LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate 
              FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON 
              CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${is_band} = 1 THEN  
              LOWER(CPDO.product_type) <> '' ELSE LOWER(CPDO.product_type) <> 
              'band' END GROUP BY config_product_id) product_diamond ON 
              (config_products.id = product_diamond.config_product_id ) 
              WHERE head_type_id = ${head} AND center_diamond_group_id = ${diamond_group?.dataValues.id}  
              AND shank_type_id= ${shank} AND side_setting_id= ${side_setting}  AND CASE 
              WHEN product_metal.karat_id IS NULL THEN product_metal.metal_id = ${metal} 
              ELSE product_metal.metal_id = ${metal} AND product_metal.karat_id = ${karat} END) 
              ELSE (SELECT CASE WHEN ${is_band} = 1 THEN SUM(COALESCE(config_products.retail_price, 0)+
              COALESCE(CPM.labor_charge, 0)) ELSE SUM(COALESCE(config_products.retail_price, 0)) END 
              FROM config_products LEFT OUTER JOIN config_product_metals AS CPM ON 
              CPM.config_product_id = config_products.id WHERE  config_products.id = "config_products"."id" AND  
              CPM.head_shank_band = 'band') END   ELSE CASE WHEN "file_type" != 3 THEN 
              (SELECT  CASE WHEN ${diamond_type} = 1 THEN ((DGM.rate)+COALESCE(laber_charge, 0)+
              COALESCE(other_changes, 0)+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) 
              ELSE ((DGM.synthetic_rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+
              product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) END FROM 
              config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = 
              DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, 
                CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+
                COALESCE(sum(CPMO.labor_charge), 0)) ELSE  
                (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  
                END  AS metal_rate FROM config_product_metals AS 
                CPMO LEFT OUTER JOIN metal_masters AS metal_master ON 
                metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id
                 WHERE CASE WHEN ${is_band} = 1 THEN  LOWER(CPMO.head_shank_band) <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' 
                 END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) 
                 LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate 
                 FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id 
                 WHERE CASE WHEN ${is_band} = 1 THEN  LOWER(CPDO.product_type) <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY 
                 config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id )
                  WHERE head_type_id = ${head} AND center_diamond_group_id = ${diamond_group?.dataValues.id}  AND 
                  shank_type_id= ${shank} AND side_setting_id= ${side_setting}  AND CASE WHEN product_metal.karat_id IS
                   NULL THEN product_metal.metal_id = ${metal} ELSE product_metal.metal_id = ${metal} AND product_metal.karat_id = ${karat} END) ELSE (SELECT CASE WHEN ${is_band} = 1 
                    THEN SUM(COALESCE(config_products.retail_price, 0)+COALESCE(CPM.labor_charge, 0)) ELSE SUM(COALESCE(config_products.retail_price, 0)) END FROM config_products 
                    LEFT OUTER JOIN config_product_metals AS CPM ON CPM.config_product_id = config_products.id WHERE  
                    config_products.id = "config_products"."id" AND  
                    CPM.head_shank_band = 'band') END END`),
          "product_total_price",
        ],
      ],
      include: [
        // {
        //   required: true,
        //   model: DiamondGroupMaster,
        //   as: "cender_diamond",
        //   attributes: []
        // },
        {
          required: false,
          model: ConfigProductMetals,
          as: "CPMO",
          attributes: [],
        },
        // {
        //   required: true,
        //   model: ConfigProductDiamonds,
        //   as: "CPDO",
        //   attributes: []
        // },
      ],
    });

    return resSuccess({ data: configProduct[0] });
  } catch (error) {
    throw error;
  }
};

/* three stone product price find API */
const createDiamondArray = async (
  list: any,
  color,
  clarity,
  cut,
  diamond_type: any
) => {
  let sideDiamondList = [];

  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    const diamondGroup = await DiamondGroupMaster.findOne({
      where: {
        id_stone: element.id_stone,
        id_shape: element.id_shape,
        id_color: color ? color : element.dia_color,
        id_clarity: clarity ? clarity : element.dia_clarity,
        id_carat: element.id_carat,
        is_deleted: DeletedStatus.No,
        id_cuts: cut ? cut : element.dia_cuts,
      },
    });
    if (!(diamondGroup && diamondGroup.dataValues)) {
      return resNotFound({ message: DIAMOND_GROUP_NOT_FOUND });
    }

    sideDiamondList.push(
      diamond_type == 1
        ? diamondGroup.dataValues.rate * element.dia_weight * element.dia_count
        : diamondGroup.dataValues.synthetic_rate *
            element.dia_weight *
            element.dia_count
    );

    return sideDiamondList;
  }
  return sideDiamondList;
};

export const threeStoneProductRetailPriceFind = async (req: Request) => {
  try {
    const {
      center_stone,
      diamond_type,
      center_stone_shape,
      is_band,
      center_stone_size,
      center_stone_cuts,
      center_stone_clarity,
      center_stone_color,
      head,
      shank,
      side_setting,
      metal,
      karat,
      side_stone,
      id_head_metal_tone,
      id_shank_metal_tone,
      id_band_metal_tone,
      user_id,
    } = req.body;

    if (
      id_head_metal_tone &&
      id_head_metal_tone != undefined &&
      id_head_metal_tone != null &&
      id_head_metal_tone != "undefined" &&
      id_head_metal_tone != "null"
    ) {
      id_head_metal_tone;
    }
    const diamond_group = await DiamondGroupMaster.findOne({
      where: {
        id_stone: center_stone,
        id_shape: center_stone_shape,
        id_color: center_stone_color,
        id_clarity: center_stone_clarity,
        id_carat: center_stone_size ? center_stone_size : null,
        id_cuts: center_stone_cuts,
      },
    });
    if (!diamond_group && diamond_group == null) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    const configProduct = await ConfigProduct.findAll({
      order: [["id", "ASC"]],
      where: [
        { center_diamond_group_id: diamond_group?.dataValues.id },
        { head_type_id: head },
        { shank_type_id: shank },
        { side_setting_id: side_setting },
        { center_dia_type: diamond_type },
        // columnValueLowerCase("config_products.product_type", "three stone"),
        Sequelize.where(
          Sequelize.literal('"config_products"."product_type"'),
          "ILIKE",
          "three stone"
        ),
        Sequelize.where(Sequelize.literal('"CPMO"."metal_id"'), "=", metal),
        Sequelize.where(Sequelize.literal('"CPMO"."karat_id"'), "=", karat),
        Sequelize.where(
          Sequelize.literal('"CPDO"."product_type"'),
          "ILIKE",
          "side"
        ),
        Sequelize.where(
          Sequelize.literal('"CPDO"."dia_stone"'),
          "=",
          side_stone
        ),
        { is_deleted: "0" },
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
        "style_no",
        "center_diamond_group_id",
        "discount_type",
        "compare_price",
        "discount_value",
        [
          Sequelize.literal(
            `(SELECT CASE WHEN id IS NULL  THEN NULL ELSE id END FROM wishlist_products WHERE product_id = "config_products"."id" AND product_type = ${
              AllProductTypes.Three_stone_config_product
            } AND user_id = ${
              user_id &&
              user_id != undefined &&
              user_id != null &&
              user_id != "undefined" &&
              user_id != "null"
                ? user_id
                : null
            } AND id_shank_metal_tone = ${
              id_shank_metal_tone &&
              id_shank_metal_tone != "null" &&
              id_shank_metal_tone != null &&
              id_shank_metal_tone != undefined &&
              id_shank_metal_tone
                ? id_shank_metal_tone
                : null
            } AND id_head_metal_tone = ${
              id_head_metal_tone &&
              id_head_metal_tone != undefined &&
              id_head_metal_tone != null &&
              id_head_metal_tone != "undefined" &&
              id_head_metal_tone != "null"
                ? id_head_metal_tone
                : null
            }  AND CASE WHEN ${is_band} = 1 THEN id_band_metal_tone = ${
              id_band_metal_tone &&
              id_band_metal_tone != "null" &&
              id_band_metal_tone != null &&
              id_band_metal_tone != undefined &&
              id_band_metal_tone
                ? id_band_metal_tone
                : null
            } ELSE id_band_metal_tone IS NULL END AND is_band = '${is_band}')`
          ),
          "wishlist_id",
        ],
      ],
      include: [
        {
          required: false,
          model: ConfigProductMetals,
          as: "CPMO",
          attributes: [],
        },
        {
          required: false,
          model: ConfigProductDiamonds,
          as: "CPDO",
          attributes: [],
        },
      ],
    });

    const productPrice: any = await dbContext.query(
      `(
        SELECT
	(
		(
			CASE
				WHEN ${diamond_type} = 1 THEN DGM.RATE
				ELSE DGM.SYNTHETIC_RATE
			END
		) + LABER_CHARGE + PRODUCT_METAL.METAL_RATE + COALESCE(PRODUCT_DIAMOND.DIAMOND_RATE, 0)
	) as price
FROM
	CONFIG_PRODUCTS
	LEFT OUTER JOIN DIAMOND_GROUP_MASTERS AS DGM ON CONFIG_PRODUCTS.CENTER_DIAMOND_GROUP_ID = DGM.ID
	LEFT OUTER JOIN (
		SELECT
			CONFIG_PRODUCT_ID,
			CPMO.KARAT_ID,
			CPMO.METAL_ID,
			CASE
				WHEN CPMO.KARAT_ID IS NULL THEN (
					SUM(METAL_WT * (METAL_MASTER.METAL_RATE)) + COALESCE(SUM(CPMO.LABOR_CHARGE), 0)
				)
				ELSE (
					SUM(
						METAL_WT * (
							METAL_MASTER.METAL_RATE / 31.104 * GOLD_KTS.NAME / 24
						)
					) + COALESCE(SUM(CPMO.LABOR_CHARGE), 0)
				)
			END AS METAL_RATE
		FROM
			CONFIG_PRODUCT_METALS AS CPMO
			LEFT OUTER JOIN METAL_MASTERS AS METAL_MASTER ON METAL_MASTER.ID = CPMO.METAL_ID
			LEFT OUTER JOIN GOLD_KTS ON GOLD_KTS.ID = CPMO.KARAT_ID
		WHERE
			CASE
				WHEN ${is_band} = 1 THEN CPMO.HEAD_SHANK_BAND <> ''
				ELSE LOWER(CPMO.HEAD_SHANK_BAND) <> 'band'
			END
		GROUP BY
			CONFIG_PRODUCT_ID,
			CPMO.KARAT_ID,
			CPMO.METAL_ID
	) PRODUCT_METAL ON (
		CONFIG_PRODUCTS.ID = PRODUCT_METAL.CONFIG_PRODUCT_ID
	)
	LEFT OUTER JOIN (
		SELECT
			CONFIG_PRODUCT_ID,
			(
				COALESCE(
					SUM(PDGM.RATE * CPDO.DIA_COUNT * CPDO.DIA_WEIGHT),
					0
				)
			) AS DIAMOND_RATE
		FROM
			CONFIG_PRODUCT_DIAMONDS AS CPDO
			LEFT OUTER JOIN DIAMOND_GROUP_MASTERS AS PDGM ON CPDO.ID_DIAMOND_GROUP = PDGM.ID
		WHERE
			CASE
				WHEN ${is_band} = 1 THEN CPDO.PRODUCT_TYPE <> ''
				ELSE LOWER(CPDO.PRODUCT_TYPE) <> 'band'
			END
		GROUP BY
			CONFIG_PRODUCT_ID
	) PRODUCT_DIAMOND ON (
		CONFIG_PRODUCTS.ID = PRODUCT_DIAMOND.CONFIG_PRODUCT_ID
	)
WHERE
	CONFIG_PRODUCTS.ID = ${configProduct[0]?.dataValues.id}
      )`
    );

    const productSideDiamondList: any = await dbContext.query(
      `SELECT  id_stone, id_shape, id_carat, id_mm_size, dia_count, dia_weight, dia_cuts, dia_color, dia_clarity, product_type FROM config_product_diamonds LEFT OUTER JOIN diamond_group_masters ON diamond_group_masters.id = id_diamond_group WHERE config_product_id = ${configProduct[0].dataValues.id} AND CASE WHEN ${is_band} = 1 THEN  LOWER(config_product_diamonds.product_type) <> '' ELSE LOWER(config_product_diamonds.product_type) <> 'band' END `,
      { type: QueryTypes.SELECT }
    );

    const centerStone = await StoneData.findOne({
      where: { id: center_stone },
    });
    const sideStone = await StoneData.findOne({
      where: { id: side_stone },
    });

    let sideDiamondList;
    if (centerStone.dataValues.is_diamond === sideStone.dataValues.is_diamond) {
      sideDiamondList = await createDiamondArray(
        productSideDiamondList,
        center_stone_color,
        center_stone_clarity,
        center_stone_cuts,
        diamond_type
      );
    } else {
      sideDiamondList = await createDiamondArray(
        productSideDiamondList,
        null,
        null,
        null,
        diamond_type
      );
    }
    const sumTotal = sideDiamondList?.reduce(
      (accumulator: any, currentValue: any) => {
        return accumulator + currentValue;
      },
      0
    );

    return resSuccess({
      data: {
        ...configProduct[0]?.dataValues,
        product_price: productPrice[0][0]?.price,
        CPDO:
          productSideDiamondList &&
          productSideDiamondList?.map((t) => {
            return {
              dia_count: t.dia_count,
              dia_weight: t.dia_weight,
              product_type: t.product_type,
            };
          }),
      },
    });
  } catch (error) {
    throw error;
  }
};
export const publicConfigProductRetailPriceFind = async (req: Request) => {
  try {
    const {
      center_stone,
      diamond_type,
      center_stone_mm_size,
      center_stone_shape,
      is_band,
      center_stone_size,
      center_stone_cuts,
      center_stone_clarity,
      center_stone_color,
      head,
      shank,
      side_setting,
      metal,
      karat,
    } = req.body;

    const diamond_group = await DiamondGroupMaster.findOne({
      where: {
        id_stone: center_stone,
        id_shape: center_stone_shape,
        id_color: center_stone_color,
        id_clarity: center_stone_clarity,
        id_carat: center_stone_size ? center_stone_size : null,
        id_cuts: center_stone_cuts,
      },
    });
    if (!diamond_group && diamond_group == null) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }
    console.log("diamond_group", diamond_group.dataValues);

    const configProduct = await ConfigProduct.findAll({
      where: [
        { center_diamond_group_id: diamond_group?.dataValues.id },
        { head_type_id: head },
        { shank_type_id: shank },
        { side_setting_id: side_setting },
        { center_dia_type: diamond_type },
        Sequelize.where(Sequelize.literal('"CPMO"."metal_id"'), "=", metal),
        Sequelize.where(Sequelize.literal('"CPMO"."karat_id"'), "=", karat),
        { is_deleted: "0" },
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
        "discount_type",
        "compare_price",
        "discount_value",
        [
          Sequelize.literal(`CASE WHEN 
          'zamles' = '${PROCESS_ENVIRONMENT}'  THEN  CASE WHEN "file_type" != 3 THEN 
          (SELECT  CASE WHEN ${diamond_type} = 1 THEN 
            ((DGM.rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+
            (product_metal.metal_rate*9.754)+COALESCE(product_diamond.diamond_rate, 0)) 
            ELSE ((DGM.synthetic_rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+
            (product_metal.metal_rate*9.754)+COALESCE(product_diamond.diamond_rate, 0)) END
             FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON 
             config_products.center_diamond_group_id = DGM.id 
             LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , 
              CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN 
              (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) 
              ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  
              END  AS metal_rate FROM config_product_metals AS CPMO 
              LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id 
              LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id 
              WHERE CASE WHEN ${is_band} = 1 THEN  LOWER(CPMO.head_shank_band) <> '' 
              ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, 
              CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) 
              LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate 
              FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON 
              CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${is_band} = 1 THEN  
              LOWER(CPDO.product_type) <> '' ELSE LOWER(CPDO.product_type) <> 
              'band' END GROUP BY config_product_id) product_diamond ON 
              (config_products.id = product_diamond.config_product_id ) 
              WHERE head_type_id = ${head} AND center_diamond_group_id = ${diamond_group?.dataValues.id}  
              AND shank_type_id= ${shank} AND side_setting_id= ${side_setting}  AND CASE 
              WHEN product_metal.karat_id IS NULL THEN product_metal.metal_id = ${metal} 
              ELSE product_metal.metal_id = ${metal} AND product_metal.karat_id = ${karat} END) 
              ELSE (SELECT CASE WHEN ${is_band} = 1 THEN SUM(COALESCE(config_products.retail_price, 0)+
              COALESCE(CPM.labor_charge, 0)) ELSE SUM(COALESCE(config_products.retail_price, 0)) END 
              FROM config_products LEFT OUTER JOIN config_product_metals AS CPM ON 
              CPM.config_product_id = config_products.id WHERE  config_products.id = "config_products"."id" AND  
              CPM.head_shank_band = 'band') END   ELSE CASE WHEN "file_type" != 3 THEN 
              (SELECT  CASE WHEN ${diamond_type} = 1 THEN ((DGM.rate)+COALESCE(laber_charge, 0)+
              COALESCE(other_changes, 0)+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) 
              ELSE ((DGM.synthetic_rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+
              product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) END FROM 
              config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = 
              DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, 
                CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+
                COALESCE(sum(CPMO.labor_charge), 0)) ELSE  
                (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  
                END  AS metal_rate FROM config_product_metals AS 
                CPMO LEFT OUTER JOIN metal_masters AS metal_master ON 
                metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id
                 WHERE CASE WHEN ${is_band} = 1 THEN  LOWER(CPMO.head_shank_band) <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' 
                 END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) 
                 LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate 
                 FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id 
                 WHERE CASE WHEN ${is_band} = 1 THEN  LOWER(CPDO.product_type) <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY 
                 config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id )
                  WHERE head_type_id = ${head} AND center_diamond_group_id = ${diamond_group?.dataValues.id}  AND 
                  shank_type_id= ${shank} AND side_setting_id= ${side_setting}  AND CASE WHEN product_metal.karat_id IS
                   NULL THEN product_metal.metal_id = ${metal} ELSE product_metal.metal_id = ${metal} AND product_metal.karat_id = ${karat} END) ELSE (SELECT CASE WHEN ${is_band} = 1 
                    THEN SUM(COALESCE(config_products.retail_price, 0)+COALESCE(CPM.labor_charge, 0)) ELSE SUM(COALESCE(config_products.retail_price, 0)) END FROM config_products 
                    LEFT OUTER JOIN config_product_metals AS CPM ON CPM.config_product_id = config_products.id WHERE  
                    config_products.id = "config_products"."id" AND  
                    CPM.head_shank_band = 'band') END END`),
          "product_total_price",
        ],
      ],
      include: [
        // {
        //   required: true,
        //   model: DiamondGroupMaster,
        //   as: "cender_diamond",
        //   attributes: []
        // },
        {
          required: false,
          model: ConfigProductMetals,
          as: "CPMO",
          attributes: [],
        },
        // {
        //   required: true,
        //   model: ConfigProductDiamonds,
        //   as: "CPDO",
        //   attributes: []
        // },
      ],
    });

    return resSuccess({ data: configProduct[0] });
  } catch (error) {
    throw error;
  }
};
/* config product price find API for Mazz */

export const configProductMazzsRetailPriceFind = async (req: Request) => {
  try {
    const {
      center_stone,
      diamond_type,
      center_stone_mm_size,
      center_stone_shape,
      is_band,
      center_stone_size,
      center_stone_cuts,
      center_stone_clarity,
      center_stone_color,
      head,
      shank,
      side_setting,
      metal,
      karat,
    } = req.body;

    const diamond_group = await DiamondGroupMaster.findOne({
      where: {
        id_stone: center_stone,
        id_shape: center_stone_shape,
        id_color: center_stone_color,
        id_clarity: center_stone_clarity,
        id_carat: center_stone_size ? center_stone_size : null,
        id_cuts: center_stone_cuts,
      },
    });

    if (!diamond_group && diamond_group == null) {
      return resNotFound({ message: PRODUCT_NOT_FOUND });
    }

    const configProduct = await ConfigProduct.findAll({
      where: [
        { center_diamond_group_id: diamond_group?.dataValues.id },
        { head_type_id: head },
        { shank_type_id: shank },
        { side_setting_id: side_setting },
        { center_dia_type: diamond_type },
        Sequelize.where(Sequelize.literal('"CPMO"."metal_id"'), "=", metal),
        Sequelize.where(Sequelize.literal('"CPMO"."karat_id"'), "=", karat),
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
        "discount_type",
        "compare_price",
        "discount_value",
        [
          Sequelize.literal(
            `CASE WHEN "file_type" != 3 THEN (SELECT  CASE WHEN ${diamond_type} = 1 THEN ((DGM.rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+(product_metal.metal_rate*9.754)+COALESCE(product_diamond.diamond_rate, 0)) ELSE ((DGM.synthetic_rate)+COALESCE(laber_charge, 0)+COALESCE(other_changes, 0)+(product_metal.metal_rate*9.754)+COALESCE(product_diamond.diamond_rate, 0)) END FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN (SUM(metal_wt*(metal_master.metal_rate))+COALESCE(sum(CPMO.labor_charge), 0)) ELSE  (SUM(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24))+COALESCE(sum(CPMO.labor_charge), 0))  END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id WHERE CASE WHEN ${is_band} = 1 THEN  LOWER(CPMO.head_shank_band) <> '' ELSE LOWER(CPMO.head_shank_band) <> 'band' END GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_count*CPDO.dia_weight), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id WHERE CASE WHEN ${is_band} = 1 THEN  LOWER(CPDO.product_type) <> '' ELSE LOWER(CPDO.product_type) <> 'band' END GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE head_type_id = ${head} AND center_diamond_group_id = ${diamond_group?.dataValues.id}  AND shank_type_id= ${shank} AND side_setting_id= ${side_setting}  AND CASE WHEN product_metal.karat_id IS NULL THEN product_metal.metal_id = ${metal} ELSE product_metal.metal_id = ${metal} AND product_metal.karat_id = ${karat} END) ELSE (SELECT CASE WHEN ${is_band} = 1 THEN SUM(COALESCE(config_products.retail_price, 0)+COALESCE(CPM.labor_charge, 0)) ELSE SUM(COALESCE(config_products.retail_price, 0)) END FROM config_products LEFT OUTER JOIN config_product_metals AS CPM ON CPM.config_product_id = config_products.id WHERE  config_products.id = "config_products"."id" AND  CPM.head_shank_band = 'band') END`
          ),
          "product_total_price",
        ],
      ],
      include: [
        // {
        //   required: true,
        //   model: DiamondGroupMaster,
        //   as: "cender_diamond",
        //   attributes: []
        // },
        {
          required: false,
          model: ConfigProductMetals,
          as: "CPMO",
          attributes: [],
        },
        // {
        //   required: true,
        //   model: ConfigProductDiamonds,
        //   as: "CPDO",
        //   attributes: []
        // },
      ],
    });
    return resSuccess({ data: configProduct[0] });
  } catch (error) {
    throw error;
  }
};
