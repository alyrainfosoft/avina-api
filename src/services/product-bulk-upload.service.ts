import {
  getLocalDate,
  prepareMessageFromParams,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../utils/shared-functions";
import { Request } from "express";
import fs = require("fs");
import {
  PRODUCT_BULK_UPLOAD_BATCH_SIZE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_BULK_UPLOAD_ZIP_MIMETYPE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../config/env.var";
import {
  CATEGORY_IS_REQUIRES,
  CATEGORY_NOT_FOUND,
  CENTER_DIAMOND_COUNT_SHOULD_BE_ONE,
  DEFAULT_STATUS_CODE_SUCCESS,
  DIAMOND_GROUP_NOT_FOUND,
  FILE_NOT_FOUND,
  GOLD_WEIGHT_REQUIRES,
  IMAGES_NOT_FOUND,
  INVALID_CATEGORY,
  INVALID_HEADER,
  LENGTH_IS_REQUIRED,
  LONG_DES_IS_REQUIRES,
  METAL_TONE_IS_REQUIRES,
  METAL_IS_REQUIRES,
  METAL_KT_IS_REQUIRES,
  METAL_KT_NOT_FOUND,
  METAL_NOT_FOUND,
  PRODUCT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  PRODUCT_EXIST_WITH_SAME_NAME,
  PRODUCT_EXIST_WITH_SAME_SKU,
  PRODUCT_IMAGE_TONE_IS_REQUIRES,
  REQUIRED_ERROR_MESSAGE,
  SETTING_TYPE_IS_REQUIRED,
  SIZE_IS_REQUIRED,
  SORT_DES_IS_REQUIRES,
  STONE_TYPE_CENTER_SHOULD_BE_ONE,
  STONE_TYPE_IS_REQUIRES,
  SUB_CATEGORY_NOT_FOUND,
  SUB_CATEGORY_REQUIRED_FOR_SUB_SUB_CATEGORY,
  SUB_SUB_CATEGORY_NOT_FOUND,
  TAG_IS_REQUIRES,
  UNPROCESSABLE_ENTITY_CODE,
  ZIP_NOT_FOUND,
} from "../utils/app-messages";
import ProductBulkUploadFile from "../model/product-bulk-upload-file.model";
import {
  ActiveStatus,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  IMAGE_TYPE,
  PRODUCT_IMAGE_TYPE,
  PRODUCT_VIDEO_TYPE,
  STONE_TYPE,
} from "../utils/app-enumeration";
import {
  GENDERLIST,
  GET_DIAMOND_PLACE_ID_FROM_LABEL,
  PRODUCT_FILE_LOCATION,
  PRODUCT_ZIP_LOCATION,
} from "../utils/app-constants";
import {
  moveFileToLocation,
  moveFileToS3ByTypeAndLocation,
} from "../helpers/file.helper";
import { TResponseReturn } from "../data/interfaces/common/common.interface";
import Tag from "../model/master/attributes/tag.model";
import { Model, Op, Sequelize } from "sequelize";
import ItemSizeData from "../model/master/attributes/item-size.model";
import ItemLengthData from "../model/master/attributes/item-length.model";
import SettingType from "../model/master/attributes/settingType.model";
import categoryData from "../model/category.model";
import MetalGroupMaster from "../model/master/attributes/metal/metal-group-master.model";
import DiamondGroupMaster from "../model/master/attributes/diamond-group-master.model";
import SettingCaratWeight from "../model/master/attributes/settingCaratWeight.model";
import dbContext from "../config/db-context";
import Product from "../model/product.model";
import ProductCategory from "../model/product-category.model";
import ProductMetalOption from "../model/product-metal-option.model";
import ProductDiamondOption from "../model/product-diamond-option.model";
import Image from "../model/image.model";
import ProductImage from "../model/product-image.model";
import ProductVideo from "../model/product-video.model";
import MetalTone from "../model/master/attributes/metal/metalTone.model";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import Gemstones from "../model/master/attributes/gemstones.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import MMSize from "../model/master/attributes/mmSize.model";
import Colors from "../model/master/attributes/colors.model";
import ClarityData from "../model/master/attributes/clarity.model";
import CutsData from "../model/master/attributes/cuts.model";
const csv = require("csv-parser");
const readXlsxFile = require("read-excel-file/node");

export const addProductsFromCSVFile = async (req: Request) => {
  try {
    if (!req.file) {
      return resUnprocessableEntity({
        message: FILE_NOT_FOUND,
      });
    }

    if (req.file.mimetype !== PRODUCT_BULK_UPLOAD_FILE_MIMETYPE) {
      return resUnprocessableEntity({
        message: PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
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
      file_type: FILE_BULK_UPLOAD_TYPE.ProductUpload,
      created_by: req.body.session_res.id_app_user,
      created_date: getLocalDate(),
    });

    const PPBUF = await processProductBulkUploadFile(
      resPBUF.dataValues.id,
      resMFTL.data,
      req.body.session_res.id_app_user
    );

    // processProductBulkUploadFile(
    //   6,
    //   "public/csv/product_csv-1678873997808.csv",
    //   req.body.session_res.id_app_user
    // );

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

    // const resAPTD = await addProductToDB(resProducts.data, idAppUser);
    // if (resAPTD.code !== DEFAULT_STATUS_CODE_SUCCESS) {
    //   return resAPTD;
    // }

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
              is_parent: row[0],
              category: row[1],
              sub_category: row[2],
              sub_sub_category: row[3],
              name: row[4],
              sku: row[5],
              tag: row[6],
              short_description: row[7],
              long_description: row[8],
              labour_charge: row[9],
              finding_charge: row[10],
              other_charge: row[11],
              setting_style_type: row[12],
              size: row[13],
              length: row[14],
              metal: row[15],
              karat: row[16],
              metal_tone: row[17],
              metal_weight: row[18],
              stone: row[19],
              shape: row[20],
              mm_size: row[21],
              color: row[22],
              clarity: row[23],
              cut: row[24],
              stone_type: row[25],
              stone_setting: row[26],
              stone_weight: row[27],
              stone_cost: row[28],
              stone_count: row[29],
              gender: row[30],
              image_tone: row[31],
              video_file: row[32],
              featured_image: row[33],
              image_visualization: row[34],
              other_Images: row[35],
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

      // fs.createReadStream(path)
      //   .pipe(csv({}))
      //   .on("data", (data: any) => {
      //     if (data.is_parent === "1") {
      //       batchSize++;
      //     }
      //     results.push(data);
      //   })
      //   .on("headers", (headers: any) => {
      //     headerList = headers;
      //   })
      //   .on("end", () => {
      //     return resolve(
      //       resSuccess({ data: { results, batchSize, headers: headerList } })
      //     );
      //   });
    } catch (e) {
      return reject(e);
    }
  });
};

const validateHeaders = async (headers: string[]) => {
  const PRODUCT_BULK_UPLOAD_HEADERS = [
    "is_parent",
    "category",
    "sub_category",
    "sub_sub_category",
    "name",
    "sku",
    "tag",
    "short_description",
    "long_description",
    "labour_charge",
    "finding_charge",
    "other_charge",
    "setting_style_type",
    "size",
    "length",
    "metal",
    "karat",
    "metal_tone",
    "metal_weight",
    "stone",
    "shape",
    "mm_size",
    "color",
    "clarity",
    "cut",
    "stone_type",
    "stone_setting",
    "stone_weight",
    "stone_cost",
    "stone_count",
    "gender",
    "image_tone",
    "video_file",
    "featured_image",
    "image_visualization",
    "other_Images",
  ];
  let errors: {
    row_id: number;
    column_id: number;
    column_name: string;
    error_message: string;
  }[] = [];
  let i;

  for (i = 0; i < headers.length; i++) {
    console.log(
      "---------------------------",
      headers[28],
      PRODUCT_BULK_UPLOAD_HEADERS[28]
    );

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

const getPipedIdFromFieldValue = async (
  model: any,
  fieldValue: string,
  fieldName: string
) => {
  if (fieldValue == null || fieldValue === "") {
    return "";
  }
  let valueList = fieldValue.split("|");

  let findData = await model.findAll({
    where: {
      is_deleted: "0",
      is_active: "1",
    },
  });
  let idList = [];
  let findDataList: any = [];
  valueList.map((value: any) => {
    const data = findData.find(
      (t: any) =>
        t[fieldName].trim().toLocaleLowerCase() ==
        value.toString().trim().toLocaleLowerCase()
    );
    findDataList.push(data);
  });
  for (const tag of findDataList) {
    tag && idList.push(tag.dataValues.id);
  }
  return idList.join("|");
};

const getPipedGenderIdFromFieldValue = async (
  list: any,
  fieldValue: string,
  fieldName: string
) => {
  if (fieldValue == null || fieldValue === "") {
    return "";
  }
  const genders = fieldValue.split("|");
  let findData: any = [];
  genders.map((value: any) => {
    const data = list.find(
      (t: any) =>
        t[fieldName].trim().toLocaleLowerCase() ==
        value.toString().trim().toLocaleLowerCase()
    );

    findData.push(data);
  });

  let idList = [];
  for (const tag of findData) {
    idList.push(tag.id);
  }

  return idList.join("|");
};

const getProductsFromRows = async (rows: any) => {
  let currentProductIndex = -1;
  let productList = [];
  try {
    let errors: {
      product_name: string;
      product_sku: string;
      error_message: string;
    }[] = [];
    for (const row of rows) {
      //const resSCI = await setCategoryId(productList);
      if (row.is_parent == "1") {
        currentProductIndex++;

        if (row.name == null) {
          errors.push({
            product_name: row.name,
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
        const productsku = await Product.findOne({
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

        if (row.tag == null) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: TAG_IS_REQUIRES,
          });
        }
        if (row.category == "rings") {
          if (row.setting_style_type == null) {
            errors.push({
              product_name: row.name,
              product_sku: row.sku,
              error_message: SETTING_TYPE_IS_REQUIRED,
            });
          }
        }
        if (row.category == null) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Category"],
            ]),
          });
        }
        if (row.category == "rings" || (row.category as string) == "bangles") {
          if (row.size == null) {
            errors.push({
              product_name: row.name,
              product_sku: row.sku,
              error_message: SIZE_IS_REQUIRED,
            });
          }
        }

        if (row.category == "necklace" || row.category == "bracelet") {
          if (row.length == null) {
            errors.push({
              product_name: row.name,
              product_sku: row.sku,
              error_message: LENGTH_IS_REQUIRED,
            });
          }
        }

        productList.push({
          sku: row.sku,
          name: row.name,
          sort_description: row.short_description,
          long_description: row.long_description,
          making_charge: row.labour_charge,
          finding_charge: row.finding_charge,
          other_charge: row.other_charge,
          gender: await getPipedGenderIdFromFieldValue(
            GENDERLIST,
            row.gender,
            "name"
          ),
          tag: await getPipedIdFromFieldValue(Tag, row.tag, "name"),
          setting_style_type: await getPipedIdFromFieldValue(
            SettingType,
            row.setting_style_type,
            "name"
          ),
          size:
            row.size && row.size != ""
              ? await getPipedIdFromFieldValue(ItemSizeData, row.size, "size")
              : "",
          length:
            row.length && row.length != ""
              ? await getPipedIdFromFieldValue(
                  ItemLengthData,
                  row.length,
                  "length"
                )
              : "",
          product_categories: [],
          product_metal_options: [],
          product_diamond_options: [],
          product_tone_file: [],
        });
        addProductDetailsToProductList(row, productList, currentProductIndex);
      } else if (row.is_parent == "0") {
        addProductDetailsToProductList(row, productList, currentProductIndex);
      }
    }

    const resSCI = await setCategoryId(productList);

    if (resSCI.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSCI.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const resSMO = await setMetalOptions(productList);
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
    const resSFT = await setFileTone(productList);

    console.log("resSFTresSFT", resSFT);
    if (resSFT.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSFT.data.map((t: any) =>
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
    console.log("e", e);
    throw e;
  }
};

const addProductDetailsToProductList = async (
  row: any,
  productList: any,
  currentProductIndex: number
) => {
  if (productList[currentProductIndex]) {
    if (row.category && row.category !== "") {
      productList[currentProductIndex].product_categories.push({
        ...(row.category && { category: row.category }),
        ...(row.sub_category !== "" ? { sub_category: row.sub_category } : {}),
        ...(row.sub_sub_category !== ""
          ? { sub_sub_category: row.sub_sub_category }
          : {}),
      });
    }
    if (row.metal && row.metal !== "") {
      productList[currentProductIndex].product_metal_options.push({
        karat: row.karat,
        metal: row.metal,
        metal_weight: row.metal_weight,
        metal_tone: row.metal_tone,
      });
    }
    if (row.stone && row.stone && row.shape !== "" && row.shape !== "") {
      productList[currentProductIndex].product_diamond_options.push({
        shape: row.shape,
        stone: row.stone,
        color: row.color,
        mm_size: row.mm_size,
        clarity: row.clarity,
        cut: row.cut,
        stone_type: row.stone_type,
        stone_setting: row.stone_setting,
        stone_weight: row.stone_weight,
        stone_count: row.stone_count,
        stone_cost: row.stone_cost,
        is_default_diamond: row.is_default_diamond,
      });
    }
    if (row.image_tone && row.image_tone !== "") {
      productList[currentProductIndex].product_tone_file.push({
        tone: row.image_tone,
        feature_image: row.featured_image && row.featured_image.split("|"),
        video_file: row.video_file && row.video_file.split("|"),
        iv_image: row.image_visualization && row.image_visualization.split("|"),
        other_Images: row.other_Images && row.other_Images.split("|"),
      });
    }
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

const getIdFromName = (name: string, list: any, fieldName: string) => {
  if (name == null || name == "") {
    return "";
  }
  let findItem = list.find(
    (item: any) =>
      item.dataValues[fieldName].toString().trim().toLocaleLowerCase() ==
      name.toString().trim().toLocaleLowerCase()
  );

  if (findItem) {
    return findItem.dataValues.id;
  }
  return findItem;
};

const setCategoryId = async (productList: any) => {
  let categoryNameList: number[] = [];
  let productCategory;
  let errors: {
    product_name: string;
    product_sku: string;
    error_message: string;
  }[] = [];

  for (let product of productList) {
    for (productCategory of product.product_categories) {
      categoryNameList.push(productCategory.category);
      if (productCategory.sub_category) {
        categoryNameList.push(productCategory.sub_category);
        if (productCategory.sub_sub_category) {
          categoryNameList.push(productCategory.sub_sub_category);
        }
      }
    }
  }

  const categoryList = await categoryData.findAll({
    where: {
      // category_name: { [Op.in]: categoryNameList },
      is_deleted: "0",
      is_active: "1",
    },
  });

  let length = productList.length;
  let categoriesLength = 0;
  let i, k;
  for (i = 0; i < length; i++) {
    categoriesLength = productList[i].product_categories.length;

    if (categoriesLength <= 0) {
      errors.push({
        product_name: productList[i].name,
        product_sku: productList[i].name,
        error_message: CATEGORY_IS_REQUIRES,
      });
    }

    for (k = 0; k < categoriesLength; k++) {
      // Add Category Check
      productList[i].product_categories[k].category = getIdFromName(
        productList[i].product_categories[k].category,
        categoryList,
        "category_name"
      );

      if (productList[i].product_categories[k].category == undefined) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].name,
          error_message: CATEGORY_NOT_FOUND,
        });
      }

      if (productList[i].product_categories[k].sub_category) {
        productList[i].product_categories[k].sub_category = getIdFromName(
          productList[i].product_categories[k].sub_category,
          categoryList,
          "category_name"
        );

        if (productList[i].product_categories[k].sub_category == undefined) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: SUB_CATEGORY_NOT_FOUND,
          });
        }

        if (productList[i].product_categories[k].sub_sub_category) {
          productList[i].product_categories[k].sub_sub_category = getIdFromName(
            productList[i].product_categories[k].sub_sub_category,
            categoryList,
            "category_name"
          );
        }

        if (
          productList[i].product_categories[k].sub_sub_category == undefined
        ) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: SUB_SUB_CATEGORY_NOT_FOUND,
          });
        }
      }
    }
  }

  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};

const setMetalOptions = async (productList: any) => {
  let configMetalNameList = [],
    configKaratNameList = [],
    pmo,
    length = productList.length,
    i,
    k,
    pmoLength = 0;

  let errors: {
    product_name: string;
    product_sku: string;
    error_message: string;
  }[] = [];

  for (let product of productList) {
    for (pmo of product.product_metal_options) {
      pmo.metal && configMetalNameList.push(pmo.metal);
      pmo.karat && configKaratNameList.push(pmo.karat);
    }
  }

  const metalList = await MetalMaster.findAll({
    where: {
      name: { [Op.in]: configMetalNameList },
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

  for (i = 0; i < length; i++) {
    pmoLength = productList[i].product_metal_options.length;
    //Metal should be selected
    if (pmoLength <= 0) {
      errors.push({
        product_name: productList[i].name,
        product_sku: productList[i].name,
        error_message: METAL_IS_REQUIRES,
      });
    }
    for (k = 0; k < pmoLength; k++) {
      //Metal Weight should not be blank
      if (productList[i].product_metal_options[k].metal != null) {
        if (productList[i].product_metal_options[k].metal_weight == null) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: GOLD_WEIGHT_REQUIRES,
          });
        }
      }

      //Metal is Gold we need to check karat & Tone
      if (productList[i].product_metal_options[k].metal == "gold") {
        if (productList[i].product_metal_options[k].karat == null) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: METAL_KT_IS_REQUIRES,
          });
        }
        if (productList[i].product_metal_options[k].metal_tone == null) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: METAL_TONE_IS_REQUIRES,
          });
        }
      }

      productList[i].product_metal_options[k].metal = getIdFromName(
        productList[i].product_metal_options[k].metal,
        metalList,
        "name"
      );

      console.log(
        "productMetal",
        productList[i].product_metal_options[k].metal
      );

      if (productList[i].product_metal_options[k].metal == undefined) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].name,
          error_message: METAL_NOT_FOUND,
        });
      }

      const karat = productList[i].product_metal_options[k].karat;
      productList[i].product_metal_options[k].karat = getIdFromName(
        karat,
        karatList,
        "name"
      );

      if (productList[i].product_metal_options[k].karat == undefined) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].name,
          error_message: METAL_KT_NOT_FOUND,
        });
      }

      const metalTone = productList[i].product_metal_options[k].metal_tone;
      const strMetalTone = await getPipedIdFromFieldValue(
        MetalTone,
        metalTone,
        "sort_code"
      );
      productList[i].product_metal_options[k].metal_tone =
        metalTone && metalTone != null && metalTone != "" ? strMetalTone : "";
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
    for (pmo of product.product_diamond_options) {
      configGroupNameList.push(pmo.diamond_group);
      configStoneSettingList.push(pmo.stone_setting);
    }
  }

  const stoneSettigList = await SettingType.findAll({
    where: {
      name: { [Op.in]: configStoneSettingList },
      is_deleted: "0",
      is_active: "1",
    },
  });
  for (i = 0; i < length; i++) {
    pmoLength = productList[i].product_diamond_options.length;
    for (k = 0; k < pmoLength; k++) {
      // productList[i].product_diamond_options[k].stone_type = getIdFromName(
      //   productList[i].product_diamond_options[k].stone_type,
      //   stoneTypeList,
      //   "name"
      // );
      productList[i].product_diamond_options[k].stone_setting = getIdFromName(
        productList[i].product_diamond_options[k].stone_setting,
        stoneSettigList,
        "name"
      );

      //Stone type should not be null

      if (
        productList[i].product_diamond_options[k].stone_type == null ||
        productList[i].product_diamond_options[k].stone_type == "null"
      ) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: STONE_TYPE_IS_REQUIRES,
        });
      }
      // stone type center should be one

      stoneTypeList.push({
        stone_type: productList[i].product_diamond_options[k].stone_type,
        stone_count: productList[i].product_diamond_options[k].stone_count,
      });

      productList[i].product_diamond_options[k].stone_type =
        GET_DIAMOND_PLACE_ID_FROM_LABEL[
          productList[i].product_diamond_options[k].stone_type
        ];

      const diamondStone = prepareDynamicMessage(
        "stone",
        productList[i].product_diamond_options[k]
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
        productList[i].product_diamond_options[k]
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
        productList[i].product_diamond_options[k]
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
        productList[i].product_diamond_options[k]
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
        productList[i].product_diamond_options[k]
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
        productList[i].product_diamond_options[k]
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
            productList[i].product_diamond_options[k].stone,
            "name"
          ),
          id_shape: await getPipedIdFromField(
            DiamondShape,
            productList[i].product_diamond_options[k].shape,
            "name"
          ),
          id_mm_size: await getPipedIdFromField(
            MMSize,
            productList[i].product_diamond_options[k].mm_size.toString(),
            "value"
          ),
          id_color: await getPipedIdFromField(
            Colors,
            productList[i].product_diamond_options[k].color,
            "value"
          ),
          id_clarity: await getPipedIdFromField(
            ClarityData,
            productList[i].product_diamond_options[k].clarity,
            "value"
          ),
          id_cuts: await getPipedIdFromField(
            CutsData,
            productList[i].product_diamond_options[k].cut,
            "value"
          ),
        },
      });

      //Check diamondGroupMaster is null or not
      //If null need to throw error
      if (diamondGroupMaster == null) {
        const diamondGroupMasterCreate: any = await DiamondGroupMaster.create({
          id_stone: await getPipedIdFromField(
            Gemstones,
            productList[i].product_diamond_options[k].stone,
            "name"
          ),
          id_shape: await getPipedIdFromField(
            DiamondShape,
            productList[i].product_diamond_options[k].shape,
            "name"
          ),
          id_mm_size: await getPipedIdFromField(
            MMSize,
            productList[i].product_diamond_options[k].mm_size.toString(),
            "value"
          ),
          id_color: await getPipedIdFromField(
            Colors,
            productList[i].product_diamond_options[k].color,
            "value"
          ),
          id_clarity: await getPipedIdFromField(
            ClarityData,
            productList[i].product_diamond_options[k].clarity,
            "value"
          ),
          id_cuts: await getPipedIdFromField(
            CutsData,
            productList[i].product_diamond_options[k].cut,
            "value"
          ),
          rate: productList[i].product_diamond_options[k].stone_cost,
          created_date: getLocalDate(),
          is_active: ActiveStatus.Active,
          is_deleted: "0",
        });

        productList[i].product_diamond_options[k].stone =
          diamondGroupMasterCreate?.id;
        productList[i].product_diamond_options[k].rate =
          diamondGroupMasterCreate?.rate;
      } else {
        productList[i].product_diamond_options[k].stone =
          diamondGroupMaster?.dataValues.id;
        productList[i].product_diamond_options[k].rate =
          diamondGroupMaster?.dataValues.rate;

        if (productList[i].product_diamond_options[k].stone_weight == null) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Diamond Weight"],
            ]),
          });
        }
      }
      // if (diamondGroupMaster == null) {
      //   errors.push({
      //     product_name: productList[i].name,
      //     product_sku: productList[i].sku,
      //     error_message: DIAMOND_GROUP_NOT_FOUND
      //   })
      // }else {

      // }
    }

    const findStoneTypeCenter = stoneTypeList.filter(
      (t: any) => t.stone_type == "Center"
    );

    // stone type center should be one
    if (findStoneTypeCenter.length > 1) {
      errors.push({
        product_name: productList[i].name,
        product_sku: productList[i].sku,
        error_message: STONE_TYPE_CENTER_SHOULD_BE_ONE,
      });
    }

    //  center stone count should be one
    if (findStoneTypeCenter.length == 1) {
      if (findStoneTypeCenter[0].stone_count != 1) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: CENTER_DIAMOND_COUNT_SHOULD_BE_ONE,
        });
      }
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

const setFileTone = async (productList: any) => {
  let toneList = [],
    ptf,
    length = productList.length,
    i,
    k,
    ptfLength = 0;
  let errors: {
    product_name: string;
    product_sku: string;
    error_message: string;
  }[] = [];

  for (let product of productList) {
    for (ptf of product.product_tone_file) {
      toneList.push(ptf.tone);
    }
  }

  const metalToneList = await MetalTone.findAll({
    where: { name: { [Op.in]: toneList }, is_deleted: "0", is_active: "1" },
  });

  for (i = 0; i < length; i++) {
    ptfLength = productList[i].product_tone_file.length;
    if (ptfLength <= 0) {
      errors.push({
        product_name: productList[i].name,
        product_sku: productList[i].sku,
        error_message: PRODUCT_IMAGE_TONE_IS_REQUIRES,
      });
    }
    for (k = 0; k < ptfLength; k++) {
      if (
        productList[i].product_tone_file[k].tone != null &&
        productList[i].product_tone_file[k].tone != "" &&
        productList[i].product_tone_file[k].tone != undefined
      ) {
        if (productList[i].product_tone_file[k].feature_image == null) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Feature Image"],
            ]),
          });
        }
        if (productList[i].product_tone_file[k].video_file == null) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Video"],
            ]),
          });
        }
      }
      productList[i].product_tone_file[k].tone = getIdFromName(
        productList[i].product_tone_file[k].tone,
        metalToneList,
        "name"
      );
    }
  }
  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};

const addProductToDB = async (productlList: any, idAppUser: number) => {
  const trn = await dbContext.transaction();
  let resProduct,
    productCategory,
    pmo,
    pdo,
    productFile,
    path,
    pcPayload: any = [],
    pmoPayload: any = [],
    pdoPayload: any = [],
    imgPayload: any = [];

  try {
    for (const product of productlList) {
      let slug = product.name.replaceAll(" ", "-");
      resProduct = await Product.create(
        {
          name: product.name,
          sku: product.sku,
          slug: slug,
          gender: product.gender,
          sort_description: product.sort_description,
          long_description: product.long_description,
          tag: product.tag,
          setting_style_type: product.setting_style_type,
          size: product.size,
          length: product.length,
          making_charge: product.making_charge,
          finding_charge: product.finding_charge,
          other_charge: product.other_charge,
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_featured: "0",
          is_trending: "0",
          is_active: "1",
          is_deleted: "0",
        },
        { transaction: trn }
      );

      for (productCategory of product.product_categories) {
        pcPayload.push({
          id_product: resProduct.dataValues.id,
          id_category: productCategory.category,
          id_sub_category: productCategory.sub_category,
          id_sub_sub_category: productCategory.sub_sub_category,
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_active: "1",
          is_deleted: "0",
        });
      }

      for (pmo of product.product_metal_options) {
        pmoPayload.push({
          id_product: resProduct.dataValues.id,
          id_karat: pmo.karat == "" ? null : pmo.karat,
          id_metal_tone: pmo.metal_tone == "" ? null : pmo.metal_tone,
          metal_weight: pmo.metal_weight,
          id_metal: pmo.metal,
          is_default: "0",
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_active: "1",
          is_deleted: "0",
        });
      }

      for (pdo of product.product_diamond_options) {
        pdoPayload.push({
          id_product: resProduct.dataValues.id,
          id_type: pdo.stone_type,
          id_setting: pdo.stone_setting == "" ? null : pdo.stone_setting,
          weight: pdo.stone_weight,
          count: pdo.stone_count,
          id_diamond_group: pdo.stone,
          is_default: "1",
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_active: "1",
          is_deleted: "0",
        });
      }

      for (productFile of product.product_tone_file) {
        for (path of productFile.feature_image) {
          imgPayload.push({
            id_product: resProduct.dataValues.id,
            id_metal_tone: productFile.tone,
            created_by: idAppUser,
            created_date: getLocalDate(),
            image_path: `${PRODUCT_FILE_LOCATION}/${product.sku}/${path}`,
            image_type: PRODUCT_IMAGE_TYPE.Feature,
          });
        }
        if (productFile.iv_image) {
          for (path of productFile.iv_image) {
            imgPayload.push({
              id_product: resProduct.dataValues.id,
              id_metal_tone: productFile.tone,
              created_by: idAppUser,
              created_date: getLocalDate(),
              image_path: `${PRODUCT_FILE_LOCATION}/${product.sku}/${path}`,
              image_type: PRODUCT_IMAGE_TYPE.IV,
            });
          }
        }

        if (productFile.other_Images) {
          for (path of productFile.other_Images) {
            imgPayload.push({
              id_product: resProduct.dataValues.id,
              id_metal_tone: productFile.tone,
              created_by: idAppUser,
              created_date: getLocalDate(),
              image_path: `${PRODUCT_FILE_LOCATION}/${product.sku}/${path}`,
              image_type: PRODUCT_IMAGE_TYPE.Image,
            });
          }
        }

        for (path of productFile.video_file) {
          imgPayload.push({
            id_product: resProduct.dataValues.id,
            id_metal_tone: productFile.tone,
            created_by: idAppUser,
            created_date: getLocalDate(),
            image_path: `${PRODUCT_FILE_LOCATION}/${product.sku}/${path}`,
            image_type: PRODUCT_IMAGE_TYPE.Video,
          });
        }
      }
    }

    await ProductCategory.bulkCreate(pcPayload, { transaction: trn });
    await ProductMetalOption.bulkCreate(pmoPayload, { transaction: trn });
    await ProductDiamondOption.bulkCreate(pdoPayload, { transaction: trn });
    await ProductImage.bulkCreate(imgPayload, { transaction: trn });

    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};

export const addProductZip = async (req: Request) => {
  try {
    if (!req.file) {
      return resUnprocessableEntity({
        message: FILE_NOT_FOUND,
      });
    }

    //Add Your code Here
    // if (req.file.mimetype !== PRODUCT_BULK_UPLOAD_ZIP_MIMETYPE) {
    //   return resUnprocessableEntity({
    //     message: PRODCUT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
    //   });
    // }

    const trn = await dbContext.transaction();
    try {
      const resMFTL = await moveFileToS3ByTypeAndLocation(dbContext,
        req.file,
        `${PRODUCT_ZIP_LOCATION}`,
        null
      );

      const resPBUF = await ProductBulkUploadFile.create({
        file_path: resMFTL.data,
        status: FILE_STATUS.Uploaded,
        file_type: FILE_BULK_UPLOAD_TYPE.ProductZipUpload,
        created_by: req.body.session_res.id_app_user,
        created_date: getLocalDate(),
      });

      if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return resMFTL;
      }

      await trn.commit();
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (e) {
    return resUnknownError({ data: e });
  }
};
