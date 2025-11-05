import { Request } from "express";
import {
  getLocalDate,
  prepareMessageFromParams,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../utils/shared-functions";
import {
  DATA_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  FILE_NOT_FOUND,
  INVALID_HEADER,
  LONG_DES_IS_REQUIRES,
  PRODUCT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  PRODUCT_EXIST_WITH_SAME_SKU,
  REQUIRED_ERROR_MESSAGE,
} from "../utils/app-messages";
import {
  PRODUCT_BULK_UPLOAD_BATCH_SIZE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../config/env.var";
import { moveFileToLocation } from "../helpers/file.helper";

import ProductBulkUploadFile from "../model/product-bulk-upload-file.model";
import { FILE_BULK_UPLOAD_TYPE, FILE_STATUS } from "../utils/app-enumeration";
import { TResponseReturn } from "../data/interfaces/common/common.interface";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import { Op, Sequelize } from "sequelize";
import MetalTone from "../model/master/attributes/metal/metalTone.model";
import ShanksData from "../model/master/attributes/shanks.model";
import SettingType from "../model/master/attributes/settingType.model";
import HeadsData from "../model/master/attributes/heads.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import ClarityData from "../model/master/attributes/clarity.model";
import CutsData from "../model/master/attributes/cuts.model";
import MMSize from "../model/master/attributes/mmSize.model";
import dbContext from "../config/db-context";
import ConfigProduct from "../model/config-product.model";
import ConfigProductDiamonds from "../model/config-product-diamonds.model";
import ConfigProductMetals from "../model/config-product-metal.model";
import SideSettingStyles from "../model/master/attributes/side-setting-styles.model";
import Gemstones from "../model/master/attributes/gemstones.model";
import Colors from "../model/master/attributes/colors.model";
import DiamondGroupMaster from "../model/master/attributes/diamond-group-master.model";
const readXlsxFile = require("read-excel-file/node");

export const addConfigProductsFromCSVFile = async (req: Request) => {
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
              shak_type: row[1],
              setting_type: row[2],
              head_type: row[3],
              center_stone: row[4],
              center_diamond_shape: row[5],
              center_diamond_color: row[6],
              center_diamond_cut: row[7],
              center_diamond_clarity: row[8],
              center_diamond_mm: row[9],
              center_diamond_count: row[10],
              center_diamond_weight: row[11],
              head_no: row[12],
              shank_no: row[13],
              ring_no: row[14],
              product_name: row[15],
              long_description: row[16],
              short_description: row[17],
              sku: row[18],
              head_shank: row[19],
              metal: row[20],
              karat: row[21],
              metal_tone: row[22],
              metal_weight: row[23],
              prod_type: row[24],
              product_dia: row[25],
              product_dia_shape: row[26],
              product_dia_cut: row[27],
              product_dia_clarity: row[28],
              product_dia_color: row[29],
              product_dia_mm_size: row[30],
              product_dia_weight: row[31],
              product_dia_count: row[32],
              laber_charge: row[33],
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
    "center_stone",
    "center_diamond_shape",
    "center_diamond_color",
    "center_diamond_cut",
    "center_diamond_clarity",
    "center_diamond_mm",
    "center_diamond_count",
    "center_diamond_weight",
    "head_no",
    "shank_no",
    "ring_no",
    "product_name",
    "long_description",
    "short_description",
    "sku",
    "head_shank",
    "metal",
    "karat",
    "metal_tone",
    "metal_weight",
    "prod_type",
    "product_dia",
    "product_dia_shape",
    "product_dia_cut",
    "product_dia_clarity",
    "product_dia_color",
    "product_dia_mm_size",
    "product_dia_weight",
    "product_dia_count",
    "laber_charge",
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

const getPipedIdFromFieldValue = async (
  model: any,
  fieldValue: string,
  fieldName: string
) => {
  if (fieldValue == null || fieldValue === "") {
    return "";
  }
  let valueList = fieldValue.toString().toLocaleLowerCase().split("|");

  console.log("valueList", valueList);

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

const prepareDynamicMessage = (fieldName: string, value: any) => {
  let errors: {
    row_id: number;
    error_message: string;
  }[] = [];

  let arrFields = ["shape", "stone", "mm_size", "color", "cut", "clarity"];
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

const addProductDetailsToProductList = async (
  row: any,
  productList: any,
  currentProductIndex: number
) => {
  if (productList[currentProductIndex]) {
    if (row.prod_type && row.prod_type !== "") {
      productList[currentProductIndex].product_diamond_details.push({
        prod_type: row.prod_type,
        shape: row.product_dia_shape,
        stone: row.product_dia,
        color: row.product_dia_color,
        mm_size: row.product_dia_mm_size,
        clarity: row.product_dia_clarity,
        cut: row.product_dia_cut,
        stone_type: row.stone_type,
        stone_weight: row.product_dia_weight,
        stone_count: row.product_dia_count,
        product_dia_group: null,
      });
    }

    if (row.head_shank && row.head_shank !== "") {
      productList[currentProductIndex].product_metal_details.push({
        head_shank: row.head_shank,
        metal: row.metal,
        karat: row.karat,
        metal_tone: row.metal_tone,
        metal_weight: row.metal_weight,
      });
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

  console.log("configMetalNameList", configMetalNameList);

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
      const diamondStone = prepareDynamicMessage(
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
      const diamondshape = prepareDynamicMessage(
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
      const diamondMMSize = prepareDynamicMessage(
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
      const diamondColor = prepareDynamicMessage(
        "color",
        productList[i].product_diamond_details[k]
      );
      diamondColor?.data.map((t: any) =>
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: t.error_message,
        })
      );
      const diamondCut = prepareDynamicMessage(
        "cut",
        productList[i].product_diamond_details[k]
      );
      diamondCut?.data.map((t: any) =>
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: t.error_message,
        })
      );
      const diamondClarity = prepareDynamicMessage(
        "clarity",
        productList[i].product_diamond_details[k]
      );
      diamondClarity?.data.map((t: any) =>
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: t.error_message,
        })
      );

      const diamondGroupMaster = await DiamondGroupMaster.findOne({
        where: {
          id_stone: await getPipedIdFromField(
            Gemstones,
            productList[i].product_diamond_details[k].stone,
            "name"
          ),
          id_shape: await getPipedIdFromField(
            DiamondShape,
            productList[i].product_diamond_details[k].shape,
            "name"
          ),
          id_mm_size: await getPipedIdFromField(
            MMSize,
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
        if (productList[i].product_diamond_details[k].stone_weight == null) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Diamond Weight"],
            ]),
          });
        }
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
        if (row.product_name == null) {
          errors.push({
            product_name: row.product_name,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Product name"],
            ]),
          });
        }

        if (row.sku == null) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Product SKU"],
            ]),
          });
        }

        // const productName = await Product.findOne({ where: { name: row.name, is_deleted: "0" } })
        const productsku = await ConfigProduct.findOne({
          where: { sku: row.sku, is_deleted: "0" },
        });

        // if (productName != null) {
        //   errors.push({
        //     product_name: row.name,
        //     product_sku: row.sku,
        //     error_message: PRODUCT_EXIST_WITH_SAME_NAME,
        //   });
        // }

        if (productsku != null) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: PRODUCT_EXIST_WITH_SAME_SKU,
          });
        }

        if (row.long_description == null) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: LONG_DES_IS_REQUIRES,
          });
        }

        if (row.shak_type == null) {
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

        console.log(
          "shak_type--",
          await getIdFromName(
            row.shak_type,
            await ShanksData.findAll({ where }),
            "name"
          )
        );

        const shak_type = await getIdFromName(
          row.shak_type,
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

        if (head_type && head_type == undefined && head_type == "") {
          errors.push({
            product_name: row.product_name,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(DATA_NOT_FOUND, [
              ["field_name", "setting type"],
            ]),
          });
        }

        const diamondGroupMaster = await DiamondGroupMaster.findOne({
          where: {
            id_stone: await getPipedIdFromField(
              Gemstones,
              row.center_stone,
              "name"
            ),
            id_shape: await getPipedIdFromField(
              DiamondShape,
              row.center_diamond_shape,
              "name"
            ),
            id_mm_size: await getPipedIdFromField(
              MMSize,
              row.center_diamond_mm.toString(),
              "value"
            ),
            id_color: await getPipedIdFromField(
              Colors,
              row.center_diamond_color,
              "value"
            ),
            id_clarity: await getPipedIdFromField(
              ClarityData,
              row.center_diamond_clarity,
              "value"
            ),
            id_cuts: await getPipedIdFromField(
              CutsData,
              row.center_diamond_cut,
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
        } else {
          if (row.center_diamond_weight == null) {
            errors.push({
              product_name: row.product_name,
              product_sku: row.sku,
              error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
                ["field_name", "center Diamond Weight"],
              ]),
            });
          }
        }

        currentProductIndex++;
        productList.push({
          shak_type: shak_type,
          setting_type: setting_type,
          head_type: head_type,
          center_diamond_shape: await getIdFromName(
            row.center_diamond_shape,
            await DiamondShape.findAll({ where }),
            "name"
          ),
          center_diamond_group_id: diamondGroupMaster?.dataValues.id,
          center_diamond_weight: row.center_diamond_weight,
          head_no: row.head_no,
          shank_no: row.shank_no,
          ring_no: row.ring_no,
          product_name: row.product_name,
          long_description: row.long_description,
          sort_description: row.short_description,
          sku: row.sku,
          laber_charge: row.laber_charge,
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
    console.log("productList|--", productList);

    if (errors.length > 0) {
      return resUnprocessableEntity({ data: errors });
    }
    return resSuccess({ data: productList });
  } catch (e) {
    console.log("e", e);
    throw e;
  }
};

const addProductToDB = async (productlList: any, idAppUser: number) => {
  const trn = await dbContext.transaction();
  let resProduct,
    productMetalData,
    productDiamondData,
    prodMetalPayload: any = [],
    productDiamondPayload: any = [];

  try {
    for (const product of productlList) {
      let slug = product.product_name.replaceAll(" ", "-");

      console.log("product--", product);

      resProduct = await ConfigProduct.create(
        {
          shank_type_id: product.shak_type,
          side_setting_id: product.setting_type,
          head_type_id: product.head_type,
          head_no: product.head_no,
          shank_no: product.shank_no,
          ring_no: product.ring_no,
          product_title: product.product_name,
          product_sort_des: product.sort_description,
          product_long_des: product.long_description,
          sku: product.sku,
          center_diamond_group_id: product.center_diamond_group_id,
          center_diamond_weigth: parseFloat(product.center_diamond_weight),
          slug: slug,
          laber_charge: parseFloat(product.laber_charge),
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
          created_date: getLocalDate(),
          created_by: idAppUser,
        });
      }

      for (productDiamondData of product.product_diamond_details) {
        console.log("productDiamondData", productDiamondData);
        productDiamondPayload.push({
          config_product_id: resProduct.dataValues.id,
          product_type: productDiamondData.prod_type,
          id_diamond_group: productDiamondData.product_dia_group,
          dia_weight: parseFloat(productDiamondData.stone_weight),
          dia_count: productDiamondData.stone_count,
          created_by: idAppUser,
          created_date: getLocalDate(),
          dia_cts_individual: null,
          dia_cts: null,
          dia_size: null,
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

    if (resRows.data.batchSize > PRODUCT_BULK_UPLOAD_BATCH_SIZE) {
      return resUnprocessableEntity({
        message: PRODUCT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
      });
    }

    const resProducts = await getProductsFromRows(resRows.data.results);
    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addProductToDB(resProducts.data, idAppUser);
    if (resAPTD.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resAPTD;
    }

    return resSuccess();
  } catch (e) {
    throw e;
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

export const configProductPriceFind = async (req: Request) => {
  try {
    const {
      center_stone,
      center_stone_shape,
      center_stone_mm_size,
      center_stone_size,
      center_stone_cut,
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
        id_mm_size: center_stone_mm_size,
        id_color: center_stone_color,
        id_clarity: center_stone_clarity,
        id_cuts: center_stone_cut,
      },
    });

    const configProduct = await ConfigProduct.findAll({
      where: [
        { center_diamond_group_id: diamond_group?.dataValues.id },
        { head_type_id: head },
        { shank_type_id: shank },
        { side_setting_id: side_setting },
        { center_diamond_weigth: center_stone_size },
        Sequelize.where(Sequelize.literal('"CPMO"."metal_id"'), "=", metal),
        Sequelize.where(Sequelize.literal('"CPMO"."karat_id"'), "=", karat),
      ],
      attributes: [
        "id",
        "product_title",
        "product_sort_des",
        "product_long_des",
        "sku",
        [
          Sequelize.literal(
            `(SELECT ((DGM.rate*center_diamond_weigth)+laber_charge+product_metal.metal_rate+COALESCE(product_diamond.diamond_rate, 0)) FROM config_products LEFT OUTER JOIN diamond_group_masters AS DGM ON config_products.center_diamond_group_id = DGM.id LEFT OUTER JOIN (SELECT config_product_id, CPMO.karat_id , CPMO.metal_id, CASE WHEN CPMO.karat_id IS NULL THEN SUM(metal_wt*(metal_master.metal_rate)) ELSE sum(metal_wt*(metal_master.metal_rate/31.104*gold_kts.name/24)) END  AS metal_rate FROM config_product_metals AS CPMO LEFT OUTER JOIN metal_masters AS metal_master ON metal_master.id = CPMO.metal_id LEFT OUTER JOIN gold_kts ON gold_kts.id = CPMO.karat_id GROUP BY config_product_id, CPMO.karat_id, CPMO.metal_id) product_metal ON (config_products.id = product_metal.config_product_id ) LEFT OUTER JOIN (SELECT config_product_id, (COALESCE(sum(PDGM.rate*CPDO.dia_weight*CPDO.dia_count), 0)) AS diamond_rate FROM config_product_diamonds AS CPDO LEFT OUTER JOIN diamond_group_masters AS PDGM ON CPDO.id_diamond_group = PDGM.id GROUP BY config_product_id) product_diamond ON (config_products.id = product_diamond.config_product_id ) WHERE head_type_id = ${head} AND center_diamond_group_id = ${diamond_group?.dataValues.id}  AND shank_type_id= ${shank} AND side_setting_id= ${side_setting} AND center_diamond_weigth = ${center_stone_size} AND CASE WHEN product_metal.karat_id IS NULL THEN product_metal.metal_id = ${metal} ELSE product_metal.metal_id = ${metal} AND product_metal.karat_id = ${karat} END)`
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
