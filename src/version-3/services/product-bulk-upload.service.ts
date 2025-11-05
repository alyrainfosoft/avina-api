import {
  addActivityLogs,
  columnValueLowerCase,
  getLocalDate,
  prepareMessageFromParams,
  refreshMaterializedProductListView,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../utils/shared-functions";
import { Request } from "express";
import fs = require("fs");
import {
  PRODUCT_BULK_UPLOAD_BATCH_SIZE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_BULK_UPLOAD_ZIP_MIMETYPE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../config/env.var";
import {
  CATEGORY_IS_REQUIRES,
  CATEGORY_NOT_FOUND,
  CENTER_DIAMOND_COUNT_SHOULD_BE_ONE,
  DEFAULT_STATUS_CODE_SUCCESS,
  DIAMOND_GROUP_NOT_FOUND,
  ERROR_NOT_FOUND,
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
  MIN_MAX_LENGTH_ERROR_MESSAGE,
  NOT_FOUND_MESSAGE,
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
  STONE_TYPE_NOT_FOUND,
  SUB_CATEGORY_NOT_FOUND,
  SUB_CATEGORY_REQUIRED_FOR_SUB_SUB_CATEGORY,
  SUB_SUB_CATEGORY_NOT_FOUND,
  TAG_IS_REQUIRES,
  UNPROCESSABLE_ENTITY_CODE,
  ZIP_NOT_FOUND,
  DEFAULT_STATUS_SUCCESS,
} from "../../utils/app-messages";
import ProductBulkUploadFile from "../model/product-bulk-upload-file.model";
import {
  ActiveStatus,
  DeletedStatus,
  DIAMOND_TYPE,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
  PRODUCT_CUSTOMIZATION_STATUS,
  PRODUCT_IMAGE_TYPE,
  PRODUCT_VIDEO_TYPE,
  STONE_TYPE,
} from "../../utils/app-enumeration";
import {
  DISCOUNT_TYPE_PLACE_ID,
  GENDERLIST,
  GET_DIAMOND_PLACE_ID_FROM_LABEL,
  GET_PRODUCT_CUSTOMIZATION_LABEL_FROM_ID,
  LOG_FOR_SUPER_ADMIN,
  PRODUCT_FILE_LOCATION,
  PRODUCT_ZIP_LOCATION,
} from "../../utils/app-constants";
import {
  moveFileToLocation,
  moveFileToS3ByTypeAndLocation,
} from "../../helpers/file.helper";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import Tag from "../model/master/attributes/tag.model";
import { Model, Op, Sequelize } from "sequelize";
import SizeData from "../model/master/attributes/item-size.model";
import LengthData from "../model/master/attributes/item-length.model";
import SettingTypeData from "../model/master/attributes/settingType.model";
import categoryData from "../model/category.model";
import MetalGroupMaster from "../model/master/attributes/metal/metal-group-master.model";
import DiamondGroupMaster from "../model/master/attributes/diamond-group-master.model";
import SettingCaratWeight from "../model/master/attributes/settingCaratWeight.model";
import dbContext from "../../config/db-context";
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
import StoneData from "../model/master/attributes/gemstones.model";
import DiamondShape from "../model/master/attributes/diamondShape.model";
import MMSizeData from "../model/master/attributes/mmSize.model";
import Colors from "../model/master/attributes/colors.model";
import ClarityData from "../model/master/attributes/clarity.model";
import CutsData from "../model/master/attributes/cuts.model";
import Collection from "../model/master/attributes/collection.model";
import ItemSizeData from "../../model/master/attributes/item-size.model";
import ItemLengthData from "../../model/master/attributes/item-length.model";
import DiamondCaratSize from "../model/master/attributes/caratSize.model";
import MMSize from "../../model/master/attributes/mmSize.model";
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
      req.body.session_res.id_app_user,
      req
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
  } catch (e) { }
  return errorDetail;
};

const processProductBulkUploadFile = async (
  id: number,
  path: string,
  idAppUser: number,
  req:any
) => {
  try {
    const data = await processCSVFile(path, idAppUser,req);
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
    } catch (e) { }
  }
};

const processCSVFile = async (path: string, idAppUser: number,req:any) => {
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

    const resAPTD = await addProductToDB(resProducts.data, idAppUser,req);
    if (resAPTD.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resAPTD;
    }

    return resSuccess({ data: resProducts.data });
  } catch (e) {
    console.log(e);
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
              parent_sku: row[6],
              is_customization: row[7],
              collection: row[8],
              tag: row[9],
              short_description: row[10],
              long_description: row[11],
              labour_charge: row[12],
              finding_charge: row[13],
              other_charge: row[14],
              setting_style_type: row[15],
              size: row[16],
              length: row[17],
              metal: row[18],
              karat: row[19],
              metal_tone: row[20],
              metal_weight: row[21],
              quantity: row[22],
              stone: row[23],
              shape: row[24],
              mm_size: row[25],
              color: row[26],
              clarity: row[27],
              cut: row[28],
              stone_type: row[29],
              stone_setting: row[30],
              stone_weight: row[31],
              stone_count: row[32],
              gender: row[33],
              meta_title: row[34],
              meta_description: row[35],
              meta_tag: row[36],
              additional_detail: row[37],
              certification: row[38],
              shipping_days: row[39],
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
    "parent_sku",
    "is_customization",
    "collection",
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
    "quantity",
    "stone",
    "shape",
    "mm_size",
    "color",
    "clarity",
    "cut",
    "stone_type",
    "stone_setting",
    "stone_weight",
    "stone_count",
    "gender",
    "meta_title",
    "meta_description",
    "meta_tag",
    "additional_detail",
    "certification",
    "shipping_days",
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

const getPipedIdFromFieldValue = async (
  model: any,
  fieldValue: string,
  fieldName: string,
  returnValue: string
) => {
  if (fieldValue == null || fieldValue === "") {
    return "";
  }
  let valueList = fieldValue.toString().split("|");

  let idList = [];
  let findDataList: any = [];
  let notFoundList: any = [];
  valueList.map((value: any) => {
    const data = model.find(
      (t: any) =>
        t[fieldName].trim().toLocaleLowerCase() ==
        value.toString().trim().toLocaleLowerCase()
    );
    if (!data) {
      notFoundList.push(value);
    } else {
      findDataList.push(data);
    }
  });

  if (notFoundList.length > 0) {
    return resNotFound({
      message: prepareMessageFromParams(ERROR_NOT_FOUND, [
        ["field_name", `${returnValue} ${notFoundList.join(",")}`],
      ]),
    });
  }
  for (const tag of findDataList) {
    tag && idList.push(tag.dataValues.id);
  }
  return resSuccess({ data: idList.join("|") });
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
  let notFound: any = [];
  genders.map((value: any) => {
    const data = list.find(
      (t: any) =>
        t[fieldName].trim().toLocaleLowerCase() ==
        value.toString().trim().toLocaleLowerCase()
    );
    if (!data) {
      notFound.push(value);
    } else {
      findData.push(data);
    }
  });

  let idList = [];
  for (const tag of findData) {
    idList.push(tag.id);
  }

  if (notFound.length > 0) {
    return resNotFound({
      message: prepareMessageFromParams(ERROR_NOT_FOUND, [
        ["field_name", `Gender ${notFound.join(",")}`],
      ]),
    });
  } else {
    return resSuccess({ data: idList.join("|") });
  }
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
    const itemLengthList = await LengthData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const collectionList = await Collection.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    });
    const categoryList = await categoryData.findAll({
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

    const diamondSize = await DiamondCaratSize.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    })
    const diamondGroupMasterList = await DiamondGroupMaster.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active },
    })

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
        if (row.short_description == null) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: SORT_DES_IS_REQUIRES,
          });
        }
        if (
          row.short_description != null &&
          (row.short_description.length <= 4 ||
            row.short_description.length >= 400)
        ) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(
              MIN_MAX_LENGTH_ERROR_MESSAGE,
              [
                ["field_name", "Short Description"],
                ["min", "4"],
                ["max", "400"],
              ]
            ),
          });
        }
        if (row.long_description == null) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: LONG_DES_IS_REQUIRES,
          });
        }
        if (
          row.long_description != null &&
          (row.long_description.length <= 20 ||
            row.long_description.length >= 2000)
        ) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(
              MIN_MAX_LENGTH_ERROR_MESSAGE,
              [
                ["field_name", "Long Description"],
                ["min", "20"],
                ["max", "2000"],
              ]
            ),
          });
        }

        if (row.tag == null) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: TAG_IS_REQUIRES,
          });
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

        const gender: any =
          row.gender && row.gender != ""
            ? await getPipedGenderIdFromFieldValue(
              GENDERLIST,
              row.gender,
              "name"
            )
            : null;

        if (gender != null && gender.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: gender.message,
          });
        }

        const collection: any =
          row.collection && row.collection != ""
            ? await getPipedIdFromFieldValue(
              collectionList,
              row.collection,
              "name",
              "Collection"
            )
            : null;

        if (
          collection != null &&
          collection.code !== DEFAULT_STATUS_CODE_SUCCESS
        ) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: collection.message,
          });
        }

        const tags: any =
          row.tag && row.tag != ""
            ? await getPipedIdFromFieldValue(tagList, row.tag, "name", "Tag")
            : null;

        if (tags != null && tags.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: tags.message,
          });
        }

        const settingStyle: any =
          row.setting_style_type && row.setting_style_type != ""
            ? await getPipedIdFromFieldValue(
              settingTypeList,
              row.setting_style_type,
              "name",
              "setting style type"
            )
            : null;

        if (
          settingStyle != null &&
          settingStyle.code !== DEFAULT_STATUS_CODE_SUCCESS
        ) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: settingStyle.message,
          });
        }
        const size: any =
          row.size && row.size != ""
            ? await getPipedIdFromFieldValue(
              itemSizeList,
              row.size,
              "size",
              "Size"
            )
            : "";

        if (
          row.size &&
          row.size != "" &&
          size.code !== DEFAULT_STATUS_CODE_SUCCESS
        ) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: size.message,
          });
        }

        const length: any =
          row.length && row.length != ""
            ? await getPipedIdFromFieldValue(
              itemLengthList,
              row.length,
              "length",
              "Length"
            )
            : "";

        if (
          row.length &&
          row.length != "" &&
          length.code !== DEFAULT_STATUS_CODE_SUCCESS
        ) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: length.message,
          });
        }

        const discount = row.discount_type
          ? DISCOUNT_TYPE_PLACE_ID[row.discount_type.toLocaleLowerCase()]
          : null;

        if (row.discount_type && discount == null) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: prepareMessageFromParams(ERROR_NOT_FOUND, [
              ["field_name", "Discount Type"],
            ]),
          });
        }

        productList.push({
          sku: row.sku,
          name: row.name,
          additional_detail: row.additional_detail,
          certificate: row.certification,
          sort_description: row.short_description,
          long_description: row.long_description,
          making_charge: row.labour_charge,
          finding_charge: row.finding_charge,
          other_charge: row.other_charge,
          is_customization:
            row.is_customization &&
              row.is_customization != null &&
              row.is_customization != ""
              ? row.is_customization == "TRUE" ||
                row.is_customization == true ||
                row.is_customization == "true"
                ? GET_PRODUCT_CUSTOMIZATION_LABEL_FROM_ID["true"]
                : GET_PRODUCT_CUSTOMIZATION_LABEL_FROM_ID["false"]
              : PRODUCT_CUSTOMIZATION_STATUS.no,
          parent_sku: row.parent_sku || null,
          gender: gender && gender != null ? gender.data : null,
          collection: collection && collection != null ? collection.data : null,
          tag: tags && tags != null ? tags.data : null,
          setting_style_type:
            settingStyle && settingStyle != null ? settingStyle.data : null,
          size: size.data,
          length: length.data,
          product_type: 1,
          meta_title: row.meta_title,
          meta_description: row.meta_description,
          meta_tags: row.meta_tags,
          discount_type: discount,
          shipping_days: row.shipping_days,
          discount_value: row.discount_value,
          product_categories: [],
          product_metal_options: [],
          parent_id: null,
          product_diamond_options: [],
          product_tone_file: [],
        });
        addProductDetailsToProductList(row, productList, currentProductIndex);
      } else if (row.is_parent == "0") {
        addProductDetailsToProductList(row, productList, currentProductIndex);
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

    const resSMO = await setMetalOptions(productList, metalMasterList, karatList, metaToneList);
    if (resSMO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSMO.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const resSDO = await setDiamondOptions(productList, settingTypeList, gemstoneList, diamondShapeList, diamondColorList, diamondClarityList, diamondCutList, mmSizeList, diamondSize, diamondGroupMasterList);
    if (resSDO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSDO.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const parentSKU = await validateParentSKU(productList);
    if (parentSKU.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      parentSKU.data.map((t: any) =>
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
    const resSFT = await setFileTone(parentSKU.data);

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

    return resSuccess({ data: parentSKU.data });
  } catch (e) {
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
        quantity: row.quantity,
        metal_tone: row.metal_tone,
        retail_price: row.retail_price,
        compare_price: row.compare_price,
      });
    }
    if (row.stone && row.stone && row.shape !== "" && row.shape !== "") {
      const data = {
        shape: row.shape,
        stone: row.stone,
        color: row.color,
        mm_size: row.mm_size,
        clarity: row.clarity,
        cut: row.cut,
        stone_type: row.stone_type,
        stone_setting: row.stone_setting,
        stone_weight: row.stone_weight,
        is_default_diamond: row.is_default_diamond,
        stone_count: row.stone_count,
        stone_cost: row.stone_cost,
        rate: null,
      };
      productList[currentProductIndex].product_diamond_options.push(data);
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

const getIdFromName = (name: string, list: any, fieldName: string, returnValue: any) => {
  if (name == null || name == "") {
    return "";
  }

  let findItem = list.find(
    (item: any) =>
      item.dataValues[fieldName].toString().trim().toLocaleLowerCase() ==
      name.toString().trim().toLocaleLowerCase()
  );

  if (findItem) {
    return resSuccess({ data: findItem.dataValues.id });
  } else {
    return resNotFound({
      message: prepareMessageFromParams(ERROR_NOT_FOUND, [
        ["field_name", `${returnValue}`],
      ])
    })
  }

};

const getIdFromCategoryName = async (
  name: string,
  list: any,
  fieldName: string,
  id_parent: any
) => {
  if (name == null || name == "") {
    return "";
  }

  let findItem = list.find(
    (item: any) =>
      item.dataValues[fieldName].toString().trim().toLocaleLowerCase() ==
      name.toString().trim().toLocaleLowerCase() &&
      item.dataValues.parent_id == id_parent
  );

  if (findItem) {
    return findItem.dataValues.id;
  }
  return findItem;
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
        product_sku: productList[i].name,
        error_message: CATEGORY_IS_REQUIRES,
      });
    }

    for (k = 0; k < categoriesLength; k++) {
      // Add Category Check
      productList[i].product_categories[k].category =
        await getIdFromCategoryName(
          productList[i].product_categories[k].category,
          categoryList,
          "category_name",
          null
        );

      if (productList[i].product_categories[k].category == undefined) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].name,
          error_message: CATEGORY_NOT_FOUND,
        });
      }

      if (productList[i].product_categories[k].sub_category) {
        productList[i].product_categories[k].sub_category =
          await getIdFromCategoryName(
            productList[i].product_categories[k].sub_category,
            categoryList,
            "category_name",
            productList[i].product_categories[k].category
          );

        if (productList[i].product_categories[k].sub_category == undefined) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].name,
            error_message: SUB_CATEGORY_NOT_FOUND,
          });
        }

        if (productList[i].product_categories[k].sub_sub_category) {
          productList[i].product_categories[k].sub_sub_category =
            await getIdFromCategoryName(
              productList[i].product_categories[k].sub_sub_category,
              categoryList,
              "category_name",
              productList[i].product_categories[k].sub_category
            );
        }

        if (
          productList[i].product_categories[k].sub_sub_category === undefined
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

const setMetalOptions = async (productList: any, metalList: any, karatList: any, metalToneList: any) => {
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
      pmo.metal &&
        configMetalNameList.push(pmo.metal.toString().toLocaleLowerCase());
      pmo.karat && configKaratNameList.push(pmo.karat);
    }
  }

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

      const metal: any = await getIdFromName(
        productList[i].product_metal_options[k].metal,
        metalList,
        "name",
        'Metal'
      )

      if (metal.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].name,
          error_message: metal.message,
        });
      } else {
        productList[i].product_metal_options[k].metal = metal.data;
      }


      const karat: any = await getIdFromName(
        productList[i].product_metal_options[k].karat,
        karatList,
        "name",
        "Karat"
      );

      if (karat.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].name,
          error_message: karat.message,
        });
      } else {
        productList[i].product_metal_options[k].karat = karat.data;
      }

      const metalTone = productList[i].product_metal_options[k].metal_tone;

      const strMetalTone: any = await getPipedIdFromFieldValue(
        metalToneList,
        metalTone,
        "sort_code",
        "Metal Tone"
      );

      if (strMetalTone.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].name,
          error_message: strMetalTone.message,
        });
      }

      productList[i].product_metal_options[k].metal_tone =
        metalTone && metalTone != null && metalTone != ""
          ? strMetalTone.data
          : "";
    }
  }
  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};

const setDiamondOptions = async (productList: any, stoneSettigList: any, gemstoneList: any, diamondShapeList: any, diamondColorList: any, diamondClarityList: any, diamondCutList: any, mmSizeList: any, diamondSizeList: any, diamondGroupMasterList: any) => {
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
    pmoLength = productList[i].product_diamond_options.length;
    for (k = 0; k < pmoLength; k++) {
      // productList[i].product_diamond_options[k].stone_type = getIdFromName(
      //   productList[i].product_diamond_options[k].stone_type,
      //   stoneTypeList,
      //   "name"
      // );
      if (productList[i].product_diamond_options[k].stone_setting != null) {
        const stoneSetting: any = await getIdFromName(
          productList[i].product_diamond_options[k].stone_setting,
          stoneSettigList,
          "name",
          "Stone Setting"
        )

        if (stoneSetting.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].sku,
            error_message: stoneSetting.message,
          });
        } else {
          productList[i].product_diamond_options[k].stone_setting = stoneSetting.data;

        }
      }

      //Stone type should not be null

      // stone type center should be one

      stoneTypeList.push({
        stone_type: productList[i].product_diamond_options[k].stone_type,
        stone_count: productList[i].product_diamond_options[k].stone_count,
      });

      if (productList[i].product_diamond_options[k].stone_type) {
        productList[i].product_diamond_options[k].stone_type =
          GET_DIAMOND_PLACE_ID_FROM_LABEL[
          productList[i].product_diamond_options[k].stone_type
            .toString()
            .toLocaleLowerCase()
          ];
      } else {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: STONE_TYPE_IS_REQUIRES,
        });
      }

      if (
        productList[i].product_diamond_options[k].stone_type == undefined ||
        productList[i].product_diamond_options[k].stone_type == ""
      ) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: STONE_TYPE_NOT_FOUND,
        });
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
      const mmSize: any = await getIdFromName(
        productList[i].product_diamond_options[k].mm_size,
        mmSizeList,
        "value",
        "MM Size"
      )

      if (mmSize.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: mmSize.message,
        });
      } else {

        productList[i].product_diamond_options[k].mm_size = mmSize.data;
      }

      const stone: any = await getIdFromName(
        productList[i].product_diamond_options[k].stone,
        gemstoneList,
        "name",
        "Stone"
      )

      if (stone.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: stone.message,
        });
      } else {
        productList[i].product_diamond_options[k].stone = stone.data;
      }

      const diamondShape: any = await getIdFromName(
        productList[i].product_diamond_options[k].shape,
        diamondShapeList,
        "name",
        "Diamond Shape"
      )

      if (diamondShape.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: diamondShape.message,
        });
      } else {
        productList[i].product_diamond_options[k].shape = diamondShape.data;
      }

      const diamondColor: any = await getIdFromName(
        productList[i].product_diamond_options[k].color,
        diamondColorList,
        "value",
        "Diamond Color"
      )

      if (diamondColor.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: diamondColor.message,
        });
      } else {
        productList[i].product_diamond_options[k].color = diamondColor.data;
      }

      const diamondClarity: any = await getIdFromName(
        productList[i].product_diamond_options[k].clarity,
        diamondClarityList,
        "value",
        "Diamond Clarity"
      )

      if (diamondClarity.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: diamondClarity.message,
        });
      } else {
        productList[i].product_diamond_options[k].clarity = diamondClarity.data;
      }

      const diamondCut: any = await getIdFromName(
        productList[i].product_diamond_options[k].cut,
        diamondCutList,
        "value",
        "Diamond Cut"
      )

      if (diamondCut.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: diamondCut.message,
        });
      } else {
        productList[i].product_diamond_options[k].cut = diamondCut.data;
      }

      let diamondGroupMaster: any;
      if (productList[i].product_diamond_options[k].stone_type != 1) {
        diamondGroupMaster = diamondGroupMasterList.find((item) => {
          return (
            // Check the `min_carat_range` and `max_carat_range` conditions
            item.dataValues.min_carat_range <=
            productList[i].product_diamond_options[k].stone_weight &&
            item.dataValues.max_carat_range >=
            productList[i].product_diamond_options[k].stone_weight &&
            // Check each of the other conditions with a fallback to null
            item.dataValues.id_stone ===
            (productList[i].product_diamond_options[k].stone || null) &&
            item.dataValues.id_shape ===
            (productList[i].product_diamond_options[k].shape || null) &&
            item.dataValues.id_color ===
            (productList[i].product_diamond_options[k].color || null) &&
            item.dataValues.id_clarity ===
            (productList[i].product_diamond_options[k].clarity || null) &&
            item.dataValues.id_cuts ===
            (productList[i].product_diamond_options[k].cut || null)
          );
        });
      } else {
        const carat: any = await getIdFromName(
          productList[i].product_diamond_options[k].stone_weight,
          diamondSizeList,
          "value",
          "Carat"
        )

        if (carat.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          errors.push({
            product_name: productList[i].name,
            product_sku: productList[i].sku,
            error_message: carat.message,
          });
        }
        diamondGroupMaster = diamondGroupMasterList.find((item) => {
          return (
            item.dataValues.id_carat === (carat.data || null) &&
            item.dataValues.id_stone ===
            (productList[i].product_diamond_options[k].stone || null) &&
            item.dataValues.id_shape ===
            (productList[i].product_diamond_options[k].shape || null) &&
            item.dataValues.id_color ===
            (productList[i].product_diamond_options[k].color || null) &&
            item.dataValues.id_clarity ===
            (productList[i].product_diamond_options[k].clarity || null) &&
            item.dataValues.id_cuts ===
            (productList[i].product_diamond_options[k].cut || null)
          );
        });
      }

      //Check diamondGroupMaster is null or not
      //If null need to throw error
      if (diamondGroupMaster == null) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: "Diamond group master not found",
        });
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

    // stone type center should be one
    // if (findStoneTypeCenter.length > 1) {
    //   errors.push({
    //     product_name: productList[i].name,
    //     product_sku: productList[i].sku,
    //     error_message: STONE_TYPE_CENTER_SHOULD_BE_ONE
    //   })
    // }

    //  center stone count should be one
    // if (findStoneTypeCenter.length == 1) {
    //   if (findStoneTypeCenter[0].stone_count != 1) {
    //     errors.push({
    //       product_name: productList[i].name,
    //       product_sku: productList[i].sku,
    //       error_message: CENTER_DIAMOND_COUNT_SHOULD_BE_ONE
    //     })
    //   }
    // }
  }

  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};
const validateParentSKU = async (productList: any) => {
  try {
    let errors: {
      product_name: string;
      product_sku: string;
      error_message: string;
    }[] = [];
    const skuList = productList.map(
      (t: any) => t.sku && !t.parent_sku && t.sku
    );
    const parentProductId: any = [];
    for (let i = 0; i < productList.length; i++) {
      const product = productList[i];
      let parent_id = null;
      if (
        product.parent_sku &&
        product.parent_sku != null &&
        product.parent_sku != ""
      ) {
        if (!skuList.includes(product.parent_sku)) {
          const products = await Product.findOne({
            where: {
              sku: product.parent_sku,
              is_deleted: DeletedStatus.No,
              is_active: ActiveStatus.Active,
            },
          });
          if (!(products && products.dataValues)) {
            errors.push({
              product_name: product.name,
              product_sku: product.sku,
              error_message: prepareMessageFromParams(ERROR_NOT_FOUND, [
                ["field_name", "Parent SKU"],
              ]),
            });
          } else {
            parent_id = products.dataValues.id;
          }
        }
      }
      parentProductId.push({ ...product, parent_id: parent_id });
    }
    if (errors.length > 0) {
      return resUnprocessableEntity({ data: errors });
    }
    return resSuccess({ data: parentProductId });
  } catch (error) {
    return resUnprocessableEntity({ data: error });
  }
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
    where: {
      sort_code: { [Op.in]: toneList },
      is_deleted: "0",
      is_active: "1",
    },
  });

  for (i = 0; i < length; i++) {
    ptfLength = productList[i].product_tone_file.length;
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
        // if (productList[i].product_tone_file[k].video_file == null) {
        //   errors.push({
        //     product_name: productList[i].name,
        //     product_sku: productList[i].sku,
        //     error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
        //       ["field_name", "Video"],
        //     ]),
        //   });
        // }
      }

      productList[i].product_tone_file[k].tone = getIdFromName(
        productList[i].product_tone_file[k].tone,
        metalToneList,
        "sort_code",
        "Product Image Tone"
      );
    }
  }
  if (errors.length > 0) {
    return resUnprocessableEntity({ data: errors });
  }
  return resSuccess();
};

const addProductToDB = async (productList: any, idAppUser: number,req:any) => {
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
    const activityLogs = []
    for (const product of productList) {
      let productDetails: any = {}
      let slug = product.name
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll(/['/|]/g, "-");

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
          additional_detail: `<p>${product.additional_detail ? product.additional_detail : ""
            }</p>`,
          certificate: product.certificate,
          sort_description: product.sort_description,
          long_description: product.long_description,
          tag: product.tag,
          parent_id: product.parent_id,
          is_customization: product.is_customization,
          id_collection: product.collection,
          setting_style_type: product.setting_style_type,
          size: product.size,
          length: product.length,
          shipping_day: product.shipping_days,
          product_type: product.product_type,
          discount_type: product.discount_type,
          discount_value: product.discount_value,
          meta_title: product.meta_title,
          meta_description: product.meta_description,
          meta_tag: product.meta_tag,
          is_quantity_track:
            product.product_metal_options[0].quantity &&
              product.product_metal_options[0].quantity > 0
              ? true
              : false,
          making_charge: product.making_charge ? product.making_charge : 0,
          finding_charge: product.finding_charge ? product.finding_charge : 0,
          other_charge: product.other_charge ? product.other_charge : 0,
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_featured: "0",
          is_trending: "0",
          is_active: "1",
          is_deleted: "0",
        },
        { transaction: trn }
      );

      productDetails = { products: resProduct }
      if (product.parent_sku === null) {
        // Find all products whose parent_sku matches the current product's sku
        productList.forEach((p: any) => {
          if (p.parent_sku === resProduct.dataValues.sku) {
            p.parent_id = resProduct.dataValues.id; // Replace parent_sku with the parent's id
          }
        });
      }
      for (productCategory of product.product_categories) {
        const data = {
          id_product: resProduct.dataValues.id,
          id_category: productCategory.category,
          id_sub_category: productCategory.sub_category,
          id_sub_sub_category: productCategory.sub_sub_category,
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_active: "1",
          is_deleted: "0",
        }
        pcPayload.push(data);
        productDetails = { ...productDetails, category: [...productDetails.category, { ...data }] }
      }

      for (pmo of product.product_metal_options) {
        const data = {
          id_product: resProduct.dataValues.id,
          id_karat: pmo.karat == "" ? null : pmo.karat,
          id_metal_tone: pmo.metal_tone == "" ? null : pmo.metal_tone,
          metal_weight: pmo.metal_weight,
          id_metal: pmo.metal,
          quantity: pmo.quantity,
          remaing_quantity_count: pmo.quantity,
          retail_price: pmo.retail_price,
          compare_price: pmo.compare_price,
          is_default: "0",
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_active: "1",
          is_deleted: "0",
        }
        pmoPayload.push(data);
        productDetails = { ...productDetails, metals: [...productDetails.metals, { ...data }] }

      }

      for (pdo of product.product_diamond_options) {
        const data = {
          id_product: resProduct.dataValues.id,
          id_type: pdo.stone_type,
          id_setting: pdo.stone_setting == "" ? null : pdo.stone_setting,
          weight: pdo.stone_weight,
          count: pdo.stone_count,
          id_diamond_group: pdo.stone,
          is_default: "1",
          id_mm_size: pdo.mm_size || pmo.mm_size != 0 ? pdo.mm_size : null,
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_active: "1",
          is_deleted: "0",
        }
        pdoPayload.push(data);
        productDetails = { ...productDetails, diamonds: [...productDetails.diamonds, { ...data }] }
      }

      for (productFile of product.product_tone_file) {
        for (path of productFile.feature_image) {
          const fileFormat = path.split(".").pop().toLowerCase();
          let imagePath;
          if (
            fileFormat === "jpg" ||
            fileFormat === "jpeg" ||
            fileFormat === "png"
          ) {
            imagePath = path.replace(/\.[^.]+$/, ".webp");
          } else {
            imagePath = path;
          }
          imgPayload.push({
            id_product: resProduct.dataValues.id,
            id_metal_tone: productFile.tone,
            created_by: idAppUser,
            created_date: getLocalDate(),
            image_path: `${PRODUCT_FILE_LOCATION}/${product.sku}/${imagePath}`,
            image_type: PRODUCT_IMAGE_TYPE.Feature,
          });
        }
        if (productFile.iv_image) {
          for (path of productFile.iv_image) {
            const fileFormat = path.split(".").pop().toLowerCase();
            let imagePath;
            if (
              fileFormat === "jpg" ||
              fileFormat === "jpeg" ||
              fileFormat === "png"
            ) {
              imagePath = path.replace(/\.[^.]+$/, ".webp");
            } else {
              imagePath = path;
            }
            imgPayload.push({
              id_product: resProduct.dataValues.id,
              id_metal_tone: productFile.tone,
              created_by: idAppUser,
              created_date: getLocalDate(),
              image_path: `${PRODUCT_FILE_LOCATION}/${product.sku}/${imagePath}`,
              image_type: PRODUCT_IMAGE_TYPE.IV,
            });
          }
        }

        if (productFile.other_Images) {
          for (path of productFile.other_Images) {
            const fileFormat = path.split(".").pop().toLowerCase();
            let imagePath;
            if (
              fileFormat === "jpg" ||
              fileFormat === "jpeg" ||
              fileFormat === "png"
            ) {
              imagePath = path.replace(/\.[^.]+$/, ".webp");
            } else {
              imagePath = path;
            }

            imgPayload.push({
              id_product: resProduct.dataValues.id,
              id_metal_tone: productFile.tone,
              created_by: idAppUser,
              created_date: getLocalDate(),
              image_path: `${PRODUCT_FILE_LOCATION}/${product.sku}/${imagePath}`,
              image_type: PRODUCT_IMAGE_TYPE.Image,
            });
          }
        }

        if (productFile.video_file) {
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
      activityLogs.push(productDetails)
    }

    await ProductCategory.bulkCreate(pcPayload, { transaction: trn });
    await ProductMetalOption.bulkCreate(pmoPayload, { transaction: trn });
    await ProductDiamondOption.bulkCreate(pdoPayload, { transaction: trn });
    await ProductImage.bulkCreate(imgPayload, { transaction: trn });
    await trn.commit();
    await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{ old_data: null, new_data: activityLogs }], null, LogsActivityType.Add, LogsType.Product, idAppUser)
    await refreshMaterializedProductListView(dbContext);
    return resSuccess();
  } catch (e) {
    console.log(e);
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
