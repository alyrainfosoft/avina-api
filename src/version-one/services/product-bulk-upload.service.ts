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
import {
  PRODUCT_BULK_UPLOAD_BATCH_SIZE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../config/env.var";
import {
  CATEGORY_IS_REQUIRES,
  CATEGORY_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  ERROR_NOT_FOUND,
  FILE_NOT_FOUND,
  GOLD_WEIGHT_REQUIRES,
  INVALID_HEADER,
  LONG_DES_IS_REQUIRES,
  METAL_TONE_IS_REQUIRES,
  METAL_IS_REQUIRES,
  METAL_KT_IS_REQUIRES,
  MIN_MAX_LENGTH_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  PRODUCT_EXIST_WITH_SAME_SKU,
  REQUIRED_ERROR_MESSAGE,
  SORT_DES_IS_REQUIRES,
  STONE_TYPE_IS_REQUIRES,
  STONE_TYPE_NOT_FOUND,
  SUB_CATEGORY_NOT_FOUND,
  SUB_SUB_CATEGORY_NOT_FOUND,
  TAG_IS_REQUIRES,
  NOT_FOUND_CODE,
} from "../../utils/app-messages";
import {
  ActiveStatus,
  DeletedStatus,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  LogsActivityType,
  LogsType,
  PRODUCT_CUSTOMIZATION_STATUS,
  PRODUCT_IMAGE_TYPE,
} from "../../utils/app-enumeration";
import {
  DISCOUNT_TYPE_PLACE_ID,
  GENDERLIST,
  GET_DIAMOND_PLACE_ID_FROM_LABEL,
  GET_PRODUCT_CUSTOMIZATION_LABEL_FROM_ID,
  PRODUCT_FILE_LOCATION,
  PRODUCT_ZIP_LOCATION,
} from "../../utils/app-constants";
import {
  moveFileToLocation,
  moveFileToS3ByTypeAndLocation,
} from "../../helpers/file.helper";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import { Op, Sequelize } from "sequelize";
import { initModels } from "../model/index.model";
const readXlsxFile = require("read-excel-file/node");

export const addProductsFromCSVFile = async (req: Request) => {
  try {
    const {ProductBulkUploadFile} = initModels(req);
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
      req.file.originalname,
      req
    );

    if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resMFTL;
    }

    const resPBUF = await ProductBulkUploadFile.create({
      file_path: resMFTL.data,
      status: FILE_STATUS.Uploaded,
      file_type: FILE_BULK_UPLOAD_TYPE.ProductUpload,
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
    } catch (e) { }
  }
};

const processCSVFile = async (path: string, idAppUser: number,client_id:number, req: Request) => {
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

    const resProducts = await getProductsFromRows(resRows.data.results,client_id, req);
    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addProductToDB(resProducts.data, idAppUser,client_id, req);
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
      data: {notFoundList, findDataList}
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

const notFoundTagCreated = async (model: any, fieldValue: any, client_id:number, user_id:any) => {
  const payLoad = fieldValue.map((t: any) => {
    return {
      name: t,
      company_info_id: client_id,
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      created_date: getLocalDate(),
      created_by: user_id
    }
  });
  const addData = await model.bulkCreate(payLoad);

  return resSuccess({ data: addData });
};  

const notFoundProductSizeCreated = async (model: any, fieldValue: any, client_id:number, user_id:any) => {
  const payLoad = fieldValue.map((t: any) => {
    return {
      size: t,
      slug: t,
      company_info_id: client_id,
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      created_date: getLocalDate(),
      created_by: user_id
    }
  });
  const addData = await model.bulkCreate(payLoad);

  return resSuccess({ data: addData });
}; 

const notFoundProductLengthCreated = async (model: any, fieldValue: any, client_id:number, user_id:any) => {
  const payLoad = fieldValue.map((t: any) => {
    return {
      length: t,
      slug: t,
      company_info_id: client_id,
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      created_date: getLocalDate(),
      created_by: user_id
    }
  });
  const addData = await model.bulkCreate(payLoad);

  return resSuccess({ data: addData });
}; 
const getProductsFromRows = async (rows: any,client_id:number, req: Request) => {
  let currentProductIndex = -1;
  let productList = [];
  try {
    let errors: {
      product_name: string;
      product_sku: string;
      error_message: string;
    }[] = [];
const {Tag, SettingTypeData, SizeData, LengthData, Collection,DiamondCaratSize, CategoryData, MetalMaster, GoldKarat, MetalTone, StoneData, DiamondGroupMaster, DiamondShape, MMSizeData, Colors, ClarityData, CutsData,BrandData, Product} = initModels(req);
    const tagList = await Tag.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const settingTypeList = await SettingTypeData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const itemSizeList = await SizeData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const itemLengthList = await LengthData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const collectionList = await Collection.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const categoryList = await CategoryData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const metalMasterList = await MetalMaster.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const karatList = await GoldKarat.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const metaToneList = await MetalTone.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const gemstoneList = await StoneData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const diamondShapeList = await DiamondShape.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const mmSizeList = await MMSizeData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const diamondColorList = await Colors.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const diamondClarityList = await ClarityData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });
    const diamondCutList = await CutsData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    });

    const diamondSize = await DiamondCaratSize.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
    })
    const diamondGroupMasterList = await DiamondGroupMaster.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id:client_id },
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

        // const productName = await Product.findOne({ where: { name: row.name, is_deleted: DeletedStatus.No } })
        const productsku = await Product.findOne({
          where: { sku: row.sku, is_deleted: DeletedStatus.No,company_info_id:client_id },
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

        let tags: any =
          row.tag && row.tag != ""
            ? await getPipedIdFromFieldValue(tagList, row.tag, "name", "Tag")
            : null;

        if (tags != null && tags.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          if (tags.code == NOT_FOUND_CODE) {
            const addNotFound:any = await notFoundTagCreated(Tag, tags.data.notFoundList, client_id, req.body.session_res.id_app_user);
            const tagIds = [...addNotFound.data.map((item: any) => item.dataValues.id), ...tags.data.findDataList.map((item: any) => item.dataValues.id)];
            tags.data = tagIds && tagIds.length > 0 ? tagIds.join("|") : null;
          } else {
            errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: tags.message,
          });
          }
          
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
        let size: any =
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
          if (size.code == NOT_FOUND_CODE) {
            const addNotFound:any = await notFoundProductSizeCreated(SizeData, size.data.notFoundList, client_id, req.body.session_res.id_app_user);
            const itemSizeIds = [...addNotFound.data.map((item: any) => item.dataValues.id), ...size.data.findDataList.map((item: any) => item.dataValues.id)];
            size.data = itemSizeIds && itemSizeIds.length > 0 ? itemSizeIds.join("|") : null;
          } else {
            errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: size.message,
          });
          }
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
           if (length.code == NOT_FOUND_CODE) {
            const addNotFound:any = await notFoundProductSizeCreated(LengthData, length.data.notFoundList, client_id, req.body.session_res.id_app_user);
            const itemLengthIds = [...addNotFound.data.map((item: any) => item.dataValues.id), ...length.data.findDataList.map((item: any) => item.dataValues.id)];
            length.data = itemLengthIds && itemLengthIds.length > 0 ? itemLengthIds.join("|") : null;
          } else {
            errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: length.message,
          });
          }
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
          is_parent: row.is_parent,
          meta_title: row.meta_title,
          meta_description: row.meta_description,
          meta_tags: row.meta_tags,
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

    const parentSKU = await validateParentSKU(productList,client_id, req);
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
    const resSFT = await setFileTone(parentSKU.data,client_id, req);

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
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
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
      if (productList[i].product_metal_options[k].metal.toLocaleLowerCase() == "gold") {
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
      if (metal && metal.code != DEFAULT_STATUS_CODE_SUCCESS) {
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

      if (karat && karat.code != DEFAULT_STATUS_CODE_SUCCESS) {
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

      console.log("strMetalTone.code", strMetalTone.code)
      if (strMetalTone && strMetalTone.code != DEFAULT_STATUS_CODE_SUCCESS) {

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

      if (productList[i].product_diamond_options[k].mm_size && productList[i].product_diamond_options[k].mm_size != '' && mmSize !== null && mmSize.code !== DEFAULT_STATUS_CODE_SUCCESS) {
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

      const diamondCut: any = productList[i].product_diamond_options[k].cut && productList[i].product_diamond_options[k].cut !== null ? await getIdFromName(
        productList[i].product_diamond_options[k].cut,
        diamondCutList,
        "value",
        "Diamond Cut"
      ) : null

      if (diamondCut &&diamondCut !== null && diamondCut.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].sku,
          error_message: diamondCut.message,
        });
      } else {
        productList[i].product_diamond_options[k].cut =  diamondCut && diamondCut.data ? diamondCut.data : null;
      }

      let diamondGroupMaster: any;
      // if (productList[i].product_diamond_options[k].stone_type != 1) {
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
      // }
      // else {
      //   const carat: any = await getIdFromName(
      //     productList[i].product_diamond_options[k].stone_weight,
      //     diamondSizeList,
      //     "value",
      //     "Carat"
      //   )

      //   if (carat.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      //     errors.push({
      //       product_name: productList[i].name,
      //       product_sku: productList[i].sku,
      //       error_message: carat.message,
      //     });
      //   }
      //   diamondGroupMaster = diamondGroupMasterList.find((item) => {
      //     return (
      //       item.dataValues.id_carat === (carat.data || null) &&
      //       item.dataValues.id_stone ===
      //       (productList[i].product_diamond_options[k].stone || null) &&
      //       item.dataValues.id_shape ===
      //       (productList[i].product_diamond_options[k].shape || null) &&
      //       item.dataValues.id_color ===
      //       (productList[i].product_diamond_options[k].color || null) &&
      //       item.dataValues.id_clarity ===
      //       (productList[i].product_diamond_options[k].clarity || null) &&
      //       item.dataValues.id_cuts ===
      //       (productList[i].product_diamond_options[k].cut || null)
      //     );
      //   });
      // }

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
const validateParentSKU = async (productList: any,client_id:number, req: Request) => {
  try {
    let errors: {
      product_name: string;
      product_sku: string;
      error_message: string;
    }[] = [];
  const {Product} = initModels(req);

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
              company_info_id:client_id,
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

const setFileTone = async (productList: any,client_id:number, req: Request) => {
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
  const {MetalTone} = initModels(req);
  for (let product of productList) {
    for (ptf of product.product_tone_file) {
      toneList.push(ptf.tone);
    }
  }

  const metalToneList = await MetalTone.findAll({
    where: {
      sort_code: { [Op.in]: toneList },
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      company_info_id:client_id
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

const addProductToDB = async (productList: any, idAppUser: number, client_id: number, req: Request) => {
  const {Product, ProductCategory, ProductDiamondOption, ProductMetalOption,ProductImage} = initModels(req);
  const trn = await (req.body.db_connection).transaction();
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
      let productDetails: any = { category: [],metals: [], diamonds:[] }
      let slug = product.name
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll(/['/|]/g, "-");

      const sameSlugCount = await Product.count({
        where: [
          columnValueLowerCase("name", product.name),
          { is_deleted: DeletedStatus.No },
          {company_info_id:client_id},
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
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          company_info_id:client_id,
        },
        { transaction: trn }
      );

      productDetails = {...productDetails, products: resProduct.dataValues }
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
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          company_info_id:client_id,
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
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          company_info_id:client_id,
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
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          company_info_id:client_id,
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
            company_info_id:client_id,
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
              company_info_id:client_id,
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
              company_info_id:client_id,
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
              company_info_id:client_id,
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
    await addActivityLogs(req,client_id,[{ old_data: null, new_data: activityLogs }], null, LogsActivityType.Add, LogsType.Product, idAppUser,trn)
    await trn.commit();
    // await refreshMaterializedProductListView(req.body.db_connection);
    return resSuccess();
  } catch (e) {
    console.log(e);
    await trn.rollback();
    throw e;
  }
};

export const addProductZip = async (req: Request) => {
  try {
    const {ProductBulkUploadFile} = initModels(req);
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

    const trn = await (req.body.db_connection).transaction();
    try {
      const resMFTL = await moveFileToS3ByTypeAndLocation(req.body.db_connection,
        req.file,
        `${PRODUCT_ZIP_LOCATION}`,
        req?.body?.session_res?.client_id,
        req
      );

      const resPBUF = await ProductBulkUploadFile.create({
        file_path: resMFTL.data,
        status: FILE_STATUS.Uploaded,
        file_type: FILE_BULK_UPLOAD_TYPE.ProductZipUpload,
        created_by: req.body.session_res.id_app_user,
        company_info_id :req?.body?.session_res?.client_id,
        created_date: getLocalDate(),
      });

      if (resMFTL.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        await trn.rollback();
        return resMFTL;
      }
      await trn.commit();
      // await refreshMaterializedProductListView(req.body.db_connection);
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (e) {
    return resUnknownError({ data: e });
  }
};
