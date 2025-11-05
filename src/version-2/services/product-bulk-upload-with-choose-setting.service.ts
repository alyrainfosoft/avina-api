import { Request } from "express";
import {
  columnValueLowerCase,
  createSlug,
  getLocalDate,
  prepareMessageFromParams,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../utils/shared-functions";
import {
  CATEGORY_IS_REQUIRES,
  CATEGORY_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  FILE_NOT_FOUND,
  GOLD_WEIGHT_REQUIRES,
  INVALID_HEADER,
  LENGTH_IS_REQUIRED,
  LONG_DES_IS_REQUIRES,
  METAL_TONE_IS_REQUIRES,
  METAL_IS_REQUIRES,
  METAL_KT_IS_REQUIRES,
  METAL_NOT_FOUND,
  PRODUCT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  PRODUCT_EXIST_WITH_SAME_SKU,
  REQUIRED_ERROR_MESSAGE,
  SETTING_TYPE_IS_REQUIRED,
  SIZE_IS_REQUIRED,
  STONE_TYPE_IS_REQUIRES,
  SUB_CATEGORY_NOT_FOUND,
  SUB_SUB_CATEGORY_NOT_FOUND,
  TAG_IS_REQUIRES,
} from "../../utils/app-messages";
import {
  PRODUCT_BULK_UPLOAD_BATCH_SIZE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../config/env.var";
import { moveFileToLocation } from "../../helpers/file.helper";
import ProductBulkUploadFile from "../model/product-bulk-upload-file.model";
import {
  ActiveStatus,
  DeletedStatus,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  SingleProductType,
} from "../../utils/app-enumeration";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import Product from "../model/product.model";
import {
  GENDERLIST,
  GET_DIAMOND_PLACE_ID_FROM_LABEL,
} from "../../utils/app-constants";
import SizeData from "../model/master/attributes/item-size.model";
import LengthData from "../model/master/attributes/item-length.model";
import Tag from "../model/master/attributes/tag.model";
import SettingTypeData from "../model/master/attributes/settingType.model";
import Collection from "../model/master/attributes/collection.model";
import categoryData from "../model/category.model";
import BrandData from "../model/master/attributes/brands.model";
import MetalMaster from "../model/master/attributes/metal/metal-master.model";
import GoldKarat from "../model/master/attributes/metal/gold-karat.model";
import MetalTone from "../model/master/attributes/metal/metalTone.model";
import { Op } from "sequelize";
import DiamondGroupMaster from "../model/master/attributes/diamond-group-master.model";
import StoneData from "../model/master/attributes/gemstones.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import MMSizeData from "../model/master/attributes/mmSize.model";
import Colors from "../model/master/attributes/colors.model";
import ClarityData from "../model/master/attributes/clarity.model";
import CutsData from "../model/master/attributes/cuts.model";
import dbContext from "../../config/db-context";
import ProductCategory from "../model/product-category.model";
import ProductMetalOption from "../model/product-metal-option.model";
import ProductDiamondOption from "../model/product-diamond-option.model";
import ProductImage from "../model/product-image.model";
import { create } from "domain";
import { assert } from "console";
const readXlsxFile = require("read-excel-file/node");

export const addChooseSettingProductsFromCSVFile = async (req: Request) => {
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
    // if (resRows.data.batchSize > PRODUCT_BULK_UPLOAD_BATCH_SIZE) {
    //   return resUnprocessableEntity({
    //     message: PRODUCT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
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
              title: row[4],
              sku: row[5],
              brand: row[6],
              collection: row[7],
              gender: row[8],
              tag: row[9],
              short_description: row[10],
              long_description: row[11],
              setting_style_type: row[12],
              is_single: row[13],
              is_choose_setting: row[14],
              setting_diamond_shapes: row[15],
              quantity_track: row[16],
              size: row[17],
              length: row[18],
              metal: row[19],
              karat: row[20],
              metal_tone: row[21],
              metal_weight: row[22],
              quantity: row[23],
              side_dia_weight: row[24],
              side_dia_count: row[25],
              center_diamond_price: row[26],
              retail_price: row[27],
              compare_price: row[28],
              stone_type: row[29],
              stone: row[30],
              stone_category: row[31],
              certification: row[32],
              shape: row[33],
              mm_size: row[34],
              color: row[35],
              clarity: row[36],
              cut: row[37],
              stone_setting: row[38],
              stone_weight: row[39],
              stone_count: row[40],
              media: row[41],
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
    "category",
    "sub_category",
    "sub_sub_category",
    "title",
    "sku",
    "brand",
    "collection",
    "gender",
    "tag",
    "short_description",
    "long_description",
    "setting_style_type",
    "is_single",
    "is_choose_setting",
    "setting_diamond_shapes",
    "quantity_track",
    "size",
    "length",
    "metal",
    "karat",
    "metal_tone",
    "metal_weight",
    "quantity",
    "side_dia_weight",
    "side_dia_count",
    "center_diamond_price",
    "retail_price",
    "compare_price",
    "stone_type",
    "stone",
    "stone_category",
    "certification",
    "shape",
    "mm_size",
    "color",
    "clarity",
    "cut",
    "stone_setting",
    "stone_weight",
    "stone_count",
    "media",
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
      console.log("first", headers[i], PRODUCT_BULK_UPLOAD_HEADERS[i]);
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
  let productList = [];
  try {
    let errors: {
      product_name: string;
      product_sku: string;
      error_message: string;
    }[] = [];

    const tagList = await Tag.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const settingTypeList = await SettingTypeData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const itemSizeList = await SizeData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const itemlengthList = await LengthData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const collectionList = await Collection.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const categoryList = await categoryData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const brandList = await BrandData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const metalMasterList = await MetalMaster.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const karatList = await GoldKarat.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const metaToneList = await MetalTone.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const gemstoneList = await StoneData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const diamondShapeList = await DiamondShape.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const mmSizeList = await MMSizeData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const diamondColorList = await Colors.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const diamondClarityList = await ClarityData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const diamondCutList = await CutsData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });

    for (const row of rows) {
      if (row.is_parent == "1") {
        currentProductIndex++;

        const productsku = await Product.findOne({
          where: { sku: row.sku, is_deleted: "0" },
        });

        if (productsku != null) {
          errors.push({
            product_name: row.title,
            product_sku: row.sku,
            error_message: PRODUCT_EXIST_WITH_SAME_SKU,
          });
        }

        if (row.title == null) {
          errors.push({
            product_name: row.title,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Product name"],
            ]),
          });
        }

        if (row.sku == null) {
          errors.push({
            product_name: row.title,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Product SKU"],
            ]),
          });
        }

        if (row.long_description == null) {
          errors.push({
            product_name: row.title,
            product_sku: row.sku,
            error_message: LONG_DES_IS_REQUIRES,
          });
        }

        if (row.tag == null) {
          errors.push({
            product_name: row.title,
            product_sku: row.sku,
            error_message: TAG_IS_REQUIRES,
          });
        }
        if (row.category == "rings") {
          if (row.setting_style_type == null) {
            errors.push({
              product_name: row.title,
              product_sku: row.sku,
              error_message: SETTING_TYPE_IS_REQUIRED,
            });
          }
        }
        if (row.category == null) {
          errors.push({
            product_name: row.title,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Category"],
            ]),
          });
        }

        if (row.is_single == null) {
          errors.push({
            product_name: row.title,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Is single"],
            ]),
          });
        }

        if (row.is_choose_setting == null) {
          errors.push({
            product_name: row.title,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Is choose setting"],
            ]),
          });
        }

        if (
          row.is_choose_setting &&
          row.is_choose_setting.toString().toLowerCase() === "true" &&
          row.setting_diamond_shapes === null
        ) {
          errors.push({
            product_name: row.title,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Setting diamond shapes"],
            ]),
          });
        }

        productList.push({
          sku: row.sku,
          name: row.title,
          sort_description: row.short_description,
          long_description: row.long_description,
          making_charge: row.labour_charge,
          finding_charge: row.finding_charge,
          other_charge: row.other_charge,
          size: [],
          length: [],
          gender: await getPipedGenderIdFromFieldValue(
            GENDERLIST,
            row.gender,
            "name"
          ),
          tag: await getPipedTagIdFromFieldValue(tagList, row.tag, "name"),
          setting_style_type: await getPipedSettingIdFromFieldValue(
            settingTypeList,
            row.setting_style_type,
            "name"
          ),
          id_brand: row.brand
            ? getIdFromName(row.brand, brandList, "name")
            : null,
          quantity: row.quantity,
          retail_price: row.retail_price,
          compare_price: row.compare_price,
          is_quantity_track: row.quantity_track,
          id_collection: await getPipedGenderIdFromFieldValue(
            collectionList,
            row.collection,
            "name"
          ),
          product_type: 2,
          product_categories: [],
          product_metal_options: [],
          product_diamond_options: [],
          product_tone_file: [],
          is_single:
            row.is_single && row.is_single.toString().toLowerCase() === "true"
              ? "1"
              : "0",
          is_choose_setting:
            row.is_choose_setting &&
            row.is_choose_setting.toString().toLowerCase() === "true"
              ? "1"
              : "0",
          setting_diamond_shapes: await getPipedGenderIdFromFieldValue(
            diamondShapeList,
            row.setting_diamond_shapes,
            "name"
          ),
        });
        addProductDetailsToProductList(
          row,
          productList,
          currentProductIndex,
          itemSizeList,
          itemlengthList,
          diamondShapeList
        );
      } else if (row.is_parent == "0") {
        addProductDetailsToProductList(
          row,
          productList,
          currentProductIndex,
          itemSizeList,
          itemlengthList,
          diamondShapeList
        );
      }
    }

    const resSCI = await setCategoryId(productList, categoryList);

    if (resSCI.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSCI.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const resSMO = await setMetalOptions(
      productList,
      itemSizeList,
      itemlengthList,
      metalMasterList,
      karatList,
      metaToneList
    );
    if (resSMO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSMO.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const resSDO = await setDiamondOptions(
      productList,
      settingTypeList,
      gemstoneList,
      diamondShapeList,
      mmSizeList,
      diamondColorList,
      diamondClarityList,
      diamondCutList
    );
    if (resSDO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSDO.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    // const resSFT = await setFileTone(productList);

    // if (resSFT.code !== DEFAULT_STATUS_CODE_SUCCESS) {
    //   resSFT.data.map((t: any) => errors.push({
    //     product_name: t.product_name,
    //     product_sku: t.product_sku,
    //     error_message: t.error_message
    //   }))
    // }

    if (errors.length > 0) {
      return resUnprocessableEntity({ data: errors });
    }

    return resSuccess({ data: productList });
  } catch (e) {
    console.log("e", e);
    throw e;
  }
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

    if (data) {
      findData.push(data);
    }
  });

  let idList = [];
  for (const tag of findData) {
    idList.push(tag.id);
  }

  return idList.join("|");
};
const getPipedTagIdFromFieldValue = async (
  list: any,
  fieldValue: string,
  fieldName: string
) => {
  if (fieldValue == null || fieldValue === "") {
    return "";
  }
  const genders = fieldValue.split(",");
  let findData: any = [];
  genders.map(async (value: any) => {
    const data = list.find(
      (t: any) =>
        t[fieldName].trim().toLocaleLowerCase() ==
        value.toString().trim().toLocaleLowerCase()
    );

    if (data) {
      findData.push(data);
    } else {
      const tagCreate = await Tag.create({
        name: value,
        is_active: "1",
        created_by: 1,
        is_deleted: DeletedStatus.No,
        created_date: getLocalDate(),
      });
      findData.push(tagCreate.dataValues);
    }
  });

  let idList = [];
  for (const tag of findData) {
    idList.push(tag.id);
  }

  return idList.join("|");
};
const getPipedSettingIdFromFieldValue = async (
  list: any,
  fieldValue: string,
  fieldName: string
) => {
  if (fieldValue == null || fieldValue === "") {
    return "";
  }
  const genders = fieldValue.split("|");
  let findData: any = [];
  genders.map(async (value: any) => {
    const data = list.find(
      (t: any) =>
        t[fieldName].trim().toLocaleLowerCase() ==
        value.toString().trim().toLocaleLowerCase()
    );

    if (data) {
      findData.push(data);
    } else {
      const create = await SettingTypeData.create({
        name: value,
        slug: createSlug(value),
        sort_code: value,
        is_active: "1",
        is_deleted: DeletedStatus.No,
        created_by: 1,
        created_date: getLocalDate(),
      });

      findData.push(create.dataValues);
    }
  });

  let idList = [];
  for (const tag of findData) {
    idList.push(tag.id);
  }

  return idList.join("|");
};
const addProductDetailsToProductList = async (
  row: any,
  productList: any,
  currentProductIndex: number,
  sizeList: any,
  itemlengthList: any,
  diamondShapeList: any
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
    if (row.size && row.size !== "") {
      const sizeId = getIdFromName(row.size, sizeList, "size");

      if (!productList[currentProductIndex].size.includes(sizeId)) {
        productList[currentProductIndex].size.push(sizeId);
      }
    }

    if (row.length && row.length !== "") {
      const lengthId = getIdFromName(row.length, itemlengthList, "length");

      if (!productList[currentProductIndex].length.includes(lengthId)) {
        productList[currentProductIndex].length.push(lengthId);
      }
    }

    if (row.metal && row.metal !== "") {
      productList[currentProductIndex].product_metal_options.push({
        size: row.size,
        length: row.length,
        quantity: row.quantity,
        side_dia_weight: row.side_dia_weight,
        side_dia_count: row.side_dia_count,
        karat: row.karat,
        metal: row.metal,
        metal_weight: row.metal_weight,
        metal_tone: row.metal_tone,
        retail_price: row.retail_price,
        compare_price: row.compare_price,
        center_diamond_price: row.center_diamond_price,
      });
    } else if (
      !row.metal &&
      (row.metal == "" || row.metal == undefined || row.metal == null) &&
      (row.retail_price || row.metal_weight)
    ) {
      productList[currentProductIndex].product_metal_options.push({
        size: null,
        length: null,
        quantity: row.quantity,
        side_dia_weight: null,
        side_dia_count: null,
        karat: null,
        metal: null,
        metal_weight: row.metal_weight,
        metal_tone: null,
        retail_price: row.retail_price,
        compare_price: row.compare_price,
        center_diamond_price: row.center_diamond_price,
      });
    }
    if (
      row.stone_type &&
      row.stone_type &&
      row.shape !== "" &&
      row.shape !== ""
    ) {
      const data = {
        stone_type: row.stone_type,
        shape: row.shape,
        stone: row.stone,
        color: row.color,
        stone_category: row.stone_category,
        certification: row.certification,
        mm_size: row.mm_size,
        clarity: row.clarity,
        cut: row.cut,
        stone_setting: row.stone_setting,
        stone_weight: row.stone_weight,
        stone_count: row.stone_count,
        stone_cost: row.stone_cost,
        rate: null,
      };
      productList[currentProductIndex].product_diamond_options.push(data);
    }
    if (row.media && row.media !== "") {
      productList[currentProductIndex].product_tone_file.push({
        images: row.media && row.media.split("|"),
      });
    }
  }
};

const setCategoryId = async (productList: any, categoryList: any) => {
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

  let length = productList.length;
  let categoriesLength = 0;
  let i, k;
  for (i = 0; i < length; i++) {
    categoriesLength = productList[i].product_categories.length;

    if (categoriesLength <= 0) {
      errors.push({
        product_name: productList[i].name,
        product_sku: productList[i].sku,
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
          product_sku: productList[i].sku,
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
            product_sku: productList[i].sku,
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
          productList[i].product_categories[k].sub_sub_category === undefined
        ) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].sku,
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

const setMetalOptions = async (
  productList: any,
  sizeList: any,
  lengthList: any,
  metalList: any,
  karatList: any,
  metalToneList: any
) => {
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

  for (i = 0; i < length; i++) {
    pmoLength = productList[i].product_metal_options.length;
    //Metal should be selected
    if (pmoLength <= 0) {
      errors.push({
        product_name: productList[i].name,
        product_sku: productList[i].sku,
        error_message: METAL_IS_REQUIRES,
      });
    }
    for (k = 0; k < pmoLength; k++) {
      //Metal is Gold we need to check karat & Tone
      if (productList[i].product_metal_options[k].metal == "gold") {
        if (productList[i].product_metal_options[k].karat == null) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].sku,
            error_message: METAL_KT_IS_REQUIRES,
          });
        }

        if (
          productList[i].product_metal_options[k].metal &&
          productList[i].product_metal_options[k].metal_tone == null
        ) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].sku,
            error_message: METAL_TONE_IS_REQUIRES,
          });
        }
      }
      if (
        productList[i].product_metal_options[k].metal &&
        productList[i].product_metal_options[k].metal != null
      ) {
        productList[i].product_metal_options[k].metal = getIdFromName(
          productList[i].product_metal_options[k].metal,
          metalList,
          "name"
        );
      }

      const size = productList[i].product_metal_options[k].size;

      productList[i].product_metal_options[k].size = size
        ? getIdFromName(size, sizeList, "size")
        : null;

      const length = productList[i].product_metal_options[k].length;
      productList[i].product_metal_options[k].length = length
        ? getIdFromName(length, lengthList, "length")
        : null;

      const karat = productList[i].product_metal_options[k].karat;
      productList[i].product_metal_options[k].karat = productList[i]
        .product_metal_options[k].karat
        ? getIdFromName(karat, karatList, "name")
        : null;

      const metalTone = productList[i].product_metal_options[k].metal_tone;
      const strMetalTone = metalTone
        ? getIdFromName(metalTone, metalToneList, "sort_code")
        : null;
      productList[i].product_metal_options[k].metal_tone = strMetalTone;
    }
  }
  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};

const setDiamondOptions = async (
  productList: any,
  settingTypeList: any,
  gemstoneList: any,
  diamondShapeList: any,
  mmSizeList: any,
  diamondColorList: any,
  diamondClarityList: any,
  diamondCutList
) => {
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

  for (i = 0; i < length; i++) {
    pmoLength = productList[i].product_diamond_options.length;
    for (k = 0; k < pmoLength; k++) {
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

      productList[i].product_diamond_options[k].stone_type =
        GET_DIAMOND_PLACE_ID_FROM_LABEL[
          productList[i].product_diamond_options[k].stone_type.toLowerCase()
        ];

      if (productList[i].product_diamond_options[k].stone_setting != null) {
        productList[i].product_diamond_options[k].stone_setting = getIdFromName(
          productList[i].product_diamond_options[k].stone_setting,
          settingTypeList,
          "name"
        );
      }

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

      productList[i].product_diamond_options[k].stone = getIdFromName(
        productList[i].product_diamond_options[k].stone,
        gemstoneList,
        "name"
      );
      productList[i].product_diamond_options[k].shape = getIdFromName(
        productList[i].product_diamond_options[k].shape,
        diamondShapeList,
        "name"
      );
      console.log(
        "-----------------------",
        productList[i].product_diamond_options[k].mm_size
      );
      productList[i].product_diamond_options[k].mm_size = productList[i]
        .product_diamond_options[k].mm_size
        ? getIdFromName(
            productList[i].product_diamond_options[k].mm_size,
            mmSizeList,
            "value"
          )
        : null;
      productList[i].product_diamond_options[k].color = productList[i]
        .product_diamond_options[k].color
        ? getIdFromName(
            productList[i].product_diamond_options[k].color,
            diamondColorList,
            "value"
          )
        : null;
      productList[i].product_diamond_options[k].clarity = productList[i]
        .product_diamond_options[k].clarity
        ? getIdFromName(
            productList[i].product_diamond_options[k].clarity,
            diamondClarityList,
            "value"
          )
        : null;
      productList[i].product_diamond_options[k].cut = productList[i]
        .product_diamond_options[k].cut
        ? getIdFromName(
            productList[i].product_diamond_options[k].cut,
            diamondCutList,
            "value"
          )
        : null;
      const diamondGroupMaster = await DiamondGroupMaster.findOne({
        where: {
          [Op.and]: [
            {
              min_carat_range: {
                [Op.lte]:
                  productList[i].product_diamond_options[k].stone_weight,
              },
            },
            {
              max_carat_range: {
                [Op.gte]:
                  productList[i].product_diamond_options[k].stone_weight,
              },
            },
          ],
          id_stone: productList[i].product_diamond_options[k].stone,
          id_shape: productList[i].product_diamond_options[k].shape,
          id_mm_size: productList[i].product_diamond_options[k].mm_size,
          id_color: productList[i].product_diamond_options[k].color,
          id_clarity: productList[i].product_diamond_options[k].clarity,
          id_cuts: productList[i].product_diamond_options[k].cut,
        },
      });
      //Check diamondGroupMaster is null or not
      //If null need to throw error
      // if (diamondGroupMaster == null) {

      //   errors.push({
      //     product_name: productList[i].name,
      //     product_sku: `${productList[i].product_diamond_options[k].stone}-${productList[i].product_diamond_options[k].shape}-${productList[i].product_diamond_options[k].stone_weight}`,
      //     error_message: "Diamond group master not found"
      //   })

      // } else {
      productList[i].product_diamond_options[k].diamond_group_masters =
        diamondGroupMaster?.dataValues.id
          ? diamondGroupMaster?.dataValues.id
          : null;
      productList[i].product_diamond_options[k].rate = diamondGroupMaster
        ?.dataValues.rate
        ? diamondGroupMaster?.dataValues.rate
        : null;

      // }
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

const addProductToDB = async (productList: any, idAppUser: number) => {
  const trn = await dbContext.transaction();
  let resProduct,
    productCategory,
    pmo,
    pdo,
    pcPayload: any = [],
    pmoPayload: any = [],
    pdoPayload: any = [];

  try {
    for (const product of productList) {
      // slug create and same slug create then change the slug

      let slug = product.name.toLowerCase().replaceAll(" ", "-");

      const sameSlugCount = await Product.count({
        where: [
          columnValueLowerCase("name", product.name),
          { is_deleted: DeletedStatus.No },
        ],
        transaction: trn,
      });

      if (sameSlugCount > 0) {
        slug = `${slug}-${sameSlugCount}`;
      }

      resProduct = await Product.create(
        {
          name: product.name,
          sku: product.sku,
          slug: slug,
          gender: product.gender,
          sort_description: product.sort_description,
          long_description: `<p>${product.long_description}</p>`,
          tag: product.tag,
          id_collection: product.id_collection,
          setting_style_type: product.setting_style_type,
          size: product.size.join("|"),
          length: product.length.join("|"),
          id_brand: product.id_brand,
          quantity: product.quantity,
          retail_price: product.retail_price,
          compare_price: product.compare_price,
          is_quantity_track: product.is_quantity_track
            ? product.is_quantity_track
            : false,
          product_type: SingleProductType.VariantType,
          discount_type: product.discount_type,
          discount_value: product.discount_value,
          making_charge: product.making_charge ? product.making_charge : 0,
          finding_charge: product.finding_charge ? product.finding_charge : 0,
          other_charge: product.other_charge ? product.other_charge : 0,
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_featured: "0",
          is_trending: "0",
          is_single: product.is_single,
          is_choose_setting: product.is_choose_setting,
          setting_diamond_shapes: product.setting_diamond_shapes,
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
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
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
        });
      }

      for (pmo of product.product_metal_options) {
        pmoPayload.push({
          id_product: resProduct.dataValues.id,
          id_karat: pmo.karat == "" ? null : pmo.karat,
          id_m_tone:
            pmo.metal_tone && pmo.metal_tone != "" ? pmo.metal_tone : null,
          metal_weight: pmo.metal_weight,
          id_metal: pmo.metal,
          id_size: pmo.size && pmo.size != "" ? pmo.size : null,
          id_length: pmo.length && pmo.length != "" ? pmo.length : null,
          quantity: pmo.quantity,
          remaing_quantity_count: pmo.quantity,
          side_dia_weight: pmo.side_dia_weight,
          side_dia_count: pmo.side_dia_count,
          retail_price: pmo.retail_price,
          compare_price: pmo.compare_price,
          center_diamond_price: pmo.center_diamond_price || null,
          is_default: "0",
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
        });
      }

      for (pdo of product.product_diamond_options) {
        pdoPayload.push({
          id_product: resProduct.dataValues.id,
          id_type: 1,
          id_setting: pdo.stone_setting == "" ? null : pdo.stone_setting,
          weight: pdo.stone_weight,
          count: pdo.stone_count,
          id_diamond_group: pdo.diamond_group_masters,
          is_default: "1",
          id_stone: pdo.stone,
          id_shape: pdo.shape,
          id_color: pdo.color,
          id_clarity: pdo.clarity,
          id_mm_size: pdo.mm_size,
          id_cut: pdo.cut,
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
        });
      }
    }

    await ProductCategory.bulkCreate(pcPayload, {
      transaction: trn,
    });

    await ProductMetalOption.bulkCreate(pmoPayload, {
      transaction: trn,
    });
    await ProductDiamondOption.bulkCreate(pdoPayload, { transaction: trn });
    // await ProductImage.bulkCreate(imgPayload, { transaction: trn });

    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};
