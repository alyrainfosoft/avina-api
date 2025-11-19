import { Request } from "express";
import {
  addActivityLogs,
  columnValueLowerCase,
  createToneArrayBasedOnKarat,
  getLocalDate,
  prepareMessageFromParams,
  refreshMaterializedProductListView,
  resNotFound,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../utils/shared-functions";
import {
  CATEGORY_IS_REQUIRES,
  CATEGORY_NOT_FOUND,
  DEFAULT_STATUS_CODE_SUCCESS,
  FILE_NOT_FOUND,
  INVALID_HEADER,
  LONG_DES_IS_REQUIRES,
  METAL_TONE_IS_REQUIRES,
  METAL_IS_REQUIRES,
  METAL_KT_IS_REQUIRES,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  PRODUCT_EXIST_WITH_SAME_SKU,
  REQUIRED_ERROR_MESSAGE,
  SETTING_TYPE_IS_REQUIRED,
  STONE_TYPE_IS_REQUIRES,
  SUB_CATEGORY_NOT_FOUND,
  SUB_SUB_CATEGORY_NOT_FOUND,
  TAG_IS_REQUIRES,
  ERROR_NOT_FOUND,
} from "../../utils/app-messages";
import {
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../config/env.var";
import { moveFileToLocation } from "../../helpers/file.helper";
import {
  ActiveStatus,
  DeletedStatus,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  LogsActivityType,
  LogsType,
  SingleProductType,
} from "../../utils/app-enumeration";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import {
  GENDERLIST,
  GET_DIAMOND_PLACE_ID_FROM_LABEL,
} from "../../utils/app-constants";
import { initModels } from "../model/index.model";
const readXlsxFile = require("read-excel-file/node");

export const addVariantProductsFromCSVFile = async (req: Request) => {
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
      req.body.is_catalogue || false,
      req?.body?.session_res?.client_id,
      req
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
  } catch (e) { }
  return errorDetail;
};

const processProductBulkUploadFile = async (
  id: number,
  path: string,
  idAppUser: number,
  is_catalogue: boolean,
  clientId: number,
  req: Request
) => {
  const {ProductBulkUploadFile} = initModels(req);
  try {
    const data = await processCSVFile(path, idAppUser, is_catalogue, clientId, req);
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

const processCSVFile = async (
  path: string,
  idAppUser: number,
  is_catalogue: boolean,
  client_id: number,
  req: Request
) => {
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

    const resProducts = await getProductsFromRows(
      resRows.data.results,
      is_catalogue,
      client_id,
      req
    );
    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addProductToDB(resProducts.data, idAppUser,client_id, req);
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
              quantity_track: row[13],
              size: row[14],
              length: row[15],
              metal: row[16],
              karat: row[17],
              metal_tone: row[18],
              metal_weight: row[19],
              quantity: row[20],
              side_dia_weight: row[21],
              side_dia_count: row[22],
              retail_price: row[23],
              compare_price: row[24],
              stone_type: row[25],
              stone: row[26],
              stone_category: row[27],
              certification: row[28],
              shape: row[29],
              mm_size: row[30],
              color: row[31],
              clarity: row[32],
              cut: row[33],
              stone_setting: row[34],
              stone_weight: row[35],
              stone_count: row[36],
              meta_title: row[37],
              meta_description: row[38],
              meta_tag: row[39],
              additional_detail: row[40],
              shipping_days: row[41],
              
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
    "meta_title",
    "meta_description",
    "meta_tag",
    "additional_detail",
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
const getProductsFromRows = async (rows: any, is_catalogue: boolean,client_id:number, req: Request) => {
  let currentProductIndex = -1;
  let productList = [];
  try {
    let errors: {
      product_name: string;
      product_sku: string;
      error_message: string;
    }[] = [];
    const {Tag, SettingTypeData, SizeData, LengthData, Collection, CategoryData, MetalMaster, GoldKarat, MetalTone, StoneData, DiamondGroupMaster, DiamondShape, MMSizeData, Colors, ClarityData, CutsData,BrandData, Product} = initModels(req);
    const tagList = await Tag.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const settingTypeList = await SettingTypeData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const itemSizeList = await SizeData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const itemlengthList = await LengthData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const collectionList = await Collection.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const categoryList = await CategoryData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const brandList = await BrandData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const metalMasterList = await MetalMaster.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const karatList = await GoldKarat.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const metaToneList = await MetalTone.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const gemstoneList = await StoneData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const diamondShapeList = await DiamondShape.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const mmSizeList = await MMSizeData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const diamondColorList = await Colors.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const diamondClarityList = await ClarityData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });
    const diamondCutList = await CutsData.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    });

    const diamondGroupMasterList = await DiamondGroupMaster.findAll({
      where: { is_deleted: DeletedStatus.No, is_active: ActiveStatus.Active,company_info_id :client_id },
    })
    for (const row of rows) {
      if (row.is_parent == "1") {
        currentProductIndex++;

        const productsku = await Product.findOne({
          where: { sku: row.sku.toString(), is_deleted: DeletedStatus.No,company_info_id :client_id },
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

        const brand: any = row.brand ? await getIdFromName(row.brand, brandList, "name", "Brand") : null

        if (brand != null && brand.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: brand.message,
          });
        }

        const settingDiamondShape: any = row.setting_diamond_shapes ? await getPipedIdFromFieldValue(
          diamondShapeList,
          row.setting_diamond_shapes,
          "name",
          "setting Diamond shape"
        ) : null

        if (row.setting_diamond_shapes != null && settingDiamondShape.code != DEFAULT_STATUS_CODE_SUCCESS) {
          errors.push({
            product_name: row.name,
            product_sku: row.sku,
            error_message: settingDiamondShape.message,
          });
        }
        productList.push({
          sku: row.sku.toString(),
          name: row.title,
          sort_description: row.short_description,
          long_description: row.long_description,
          making_charge: row.labour_charge,
          finding_charge: row.finding_charge,
          other_charge: row.other_charge,
          additional_detail: row.additional_detail,
          certificate: row.certification,
          shipping_days: row.shipping_days,
          size: [],
          length: [],
          gender: gender && gender != null ? gender.data : null,
          tag: tags && tags != null ? tags.data : null,
          setting_style_type: settingStyle && settingStyle != null ? settingStyle.data : null,
          id_brand: row.brand
            ? brand.data
            : null,
          quantity: row.quantity,
          retail_price: row.retail_price,
          compare_price: row.compare_price,
          is_quantity_track: row.quantity_track,
          id_collection: collection && collection != null ? collection.data : null,
          product_type: is_catalogue == true ? 3 : 2,
          product_categories: [],
          product_metal_options: [],
          product_diamond_options: [],
          product_tone_file: [],
          meta_title: row.meta_title,
          meta_description: row.meta_description,
          meta_tag: row.meta_tag,
          is_single:
            row.is_single && row.is_single.toString().toLowerCase() === "true"
              ? "1"
              : "0",
          is_choose_setting:
            row.is_choose_setting &&
              row.is_choose_setting.toString().toLowerCase() === "true"
              ? "1"
              : "0",
          setting_diamond_shapes: settingDiamondShape ? settingDiamondShape.data : null,
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
      metaToneList,
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
      diamondCutList,
      settingTypeList,
      diamondGroupMasterList
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
    // if (row.size && row.size !== "") {
    //   const sizeId = getIdFromName(row.size, sizeList, "size", "Item Size");

    //   if (!productList[currentProductIndex].size.includes(sizeId)) {
    //     productList[currentProductIndex].size.push(sizeId);
    //   }
    // }

    // if (row.length && row.length !== "") {
    //   const lengthId = getIdFromName(row.length, itemlengthList, "length", );

    //   if (!productList[currentProductIndex].length.includes(lengthId)) {
    //     productList[currentProductIndex].length.push(lengthId);
    //   }
    // }

    if (row.metal && row.metal !== "") {
      if (
        row.metal_tone &&
        row.metal_tone != "" &&
        row.metal_tone.split("|").length > 1
      ) {
        for (const value of row.metal_tone.split("|")) {
          productList[currentProductIndex].product_metal_options.push({
            size: row.size,
            length: row.length,
            quantity: row.quantity,
            side_dia_weight: row.side_dia_weight,
            side_dia_count: row.side_dia_count,
            karat: row.karat,
            metal: row.metal,
            metal_weight: row.metal_weight,
            metal_tone: value,
            retail_price: row.retail_price,
            compare_price: row.compare_price,
            center_diamond_price: row.center_diamond_price,
          });
        }
      } else {
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
      }
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
        ["field_name", `${returnValue} ${name}`],
      ])
    })
  }

};

const getIDFromValueNotThenAdded = async (
  name: string,
  list: any,
  fieldName: string,
  req: Request
) => {
  const {MMSizeData} = initModels(req);
  if (name == null || name == "") {
    return "";
  }

  let findItem = await list.find(
    (item: any) =>
      item.dataValues[fieldName].toString().trim().toLocaleLowerCase() ==
      name.toString().trim().toLocaleLowerCase()
  );
  if (findItem) {
    console.log("-------------", findItem.dataValues.id);
    return findItem.dataValues.id;
  } else {
    const createdData = await MMSizeData.create({
      value: name,
      slug: name,
      is_active: ActiveStatus.Active,
      created_by: 1,
      created_date: getLocalDate(),
      is_deleted: DeletedStatus.No,
    });
    return createdData.dataValues.id;
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

      const size: any = await getIdFromName(
        productList[i].product_metal_options[k].size,
        sizeList,
        "size",
        'Item Size'
      )
      if (size.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].name,
          error_message: size.message,
        });
      } else {
        productList[i].product_metal_options[k].size = size.data;
        if (!productList[i].size.includes(size.data)) {
          productList[i].size.push(size.data);
        }
      }

      const length: any = await getIdFromName(
        productList[i].product_metal_options[k].length,
        lengthList,
        "length",
        'Item length'
      )
      if (length.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].name,
          error_message: length.message,
        });
      } else {
        productList[i].product_metal_options[k].length = length.data;
        if (!productList[i].length.includes(length.data)) {
          productList[i].length.push(length.data);
        }
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

      const metalTone: any = await getIdFromName(
        productList[i].product_metal_options[k].metal_tone,
        metalToneList,
        "sort_code",
        "Metal Tone"
      );

      if (metalTone.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        errors.push({
          product_name: productList[i].name,
          product_sku: productList[i].name,
          error_message: metalTone.message,
        });
      } else {
        productList[i].product_metal_options[k].metal_tone = metalTone.data;
      }

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
  diamondCutList: any,
  stoneSettigList: any,
  diamondGroupMasterList: any
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
      // const mmSizeListData = await MMSizeData.findAll({
      //   where: {
      //     is_active: ActiveStatus.Active,
      //     is_deleted: DeletedStatus.No,
      //   },
      // });

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
      const diamondGroupMaster = diamondGroupMasterList.find((item) => {
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

const addProductToDB = async (productList: any, idAppUser: number, client_id: number, req: Request) => {
  const {Product, ProductCategory, ProductDiamondOption, ProductMetalOption} = initModels(req);
  const trn = await (req.body.db_connection).transaction();
  let resProduct,
    productCategory,
    pmo,
    pdo,
    pcPayload: any = [],
    pmoPayload: any = [],
    pdoPayload: any = [];

  try {
    let activityLogs = []
    for (const product of productList) {
      let productDetails: any = {}
      // slug create and same slug create then change the slug

      let slug = product.name
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll(/['/|]/g, "-");

      const sameSlugCount = await Product.count({
        where: [
          columnValueLowerCase("name", product.name),
          { is_deleted: DeletedStatus.No },
          {company_info_id :client_id}
        ],
        transaction: trn,
      });

      if (sameSlugCount > 0) {
        slug = `${slug}-${sameSlugCount}`;
      }

      resProduct = await Product.create(
        {
          name: product.name,
          sku: product.sku.toString(),
          slug: slug,
          additional_detail: `<p>${product.additional_detail}</p>`,
          certificate: product.certificate || null,
          gender: product.gender,
          sort_description: product.sort_description,
          long_description: `<p>${product.long_description}</p>`,
          tag: product.tag,
          shipping_day: product.shipping_days,
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
          meta_title: product.meta_title,
          meta_description: product.meta_description,
          meta_tag: product.meta_tag,
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_featured: "0",
          is_trending: "0",
          setting_diamond_shapes: product.setting_diamond_shapes,
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          company_info_id :client_id
        },
        { transaction: trn }
      );
      productDetails = { products: resProduct }
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
          company_info_id :client_id,
        }
        pcPayload.push(data);
        productDetails = { ...productDetails, category: [...productDetails.category, { ...data }] }
      }

      const updatedPMO = await createToneArrayBasedOnKarat(
        product.product_metal_options,
        "karat",
        "metal",
        "metal_tone",
        "metal_tone_list"
      );
      for (pmo of updatedPMO) {
        const data = {
          id_product: resProduct.dataValues.id,
          id_karat: pmo.karat == "" ? null : pmo.karat,
          id_metal_tone: pmo.metal_tone_list
            ? pmo.metal_tone_list.join("|")
            : null,
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
          company_info_id :client_id,
        }
        pmoPayload.push(data);
        productDetails = { ...productDetails, metals: [...productDetails.metals, { ...data }] }
      }

      for (pdo of product.product_diamond_options) {
        const data = {
          id_product: resProduct.dataValues.id,
          id_type: pdo.stone_type == "" ? null : pdo.stone_type,
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
          company_info_id :client_id,
        }
        pdoPayload.push(data);
        productDetails = { ...productDetails, diamonds: [...productDetails.diamonds, { ...data }] }
      }

      // for (productFile of product.product_tone_file) {
      //   for (path of productFile.feature_image) {

      //     const fileFormat = path.split('.').pop().toLowerCase();
      //     let imagePath;
      //     if (fileFormat === 'jpg' || fileFormat === 'jpeg' || fileFormat === 'png') {

      //       imagePath = path.replace(/\.[^.]+$/, '.webp')
      //     } else {
      //       imagePath = path
      //     }

      //     imgPayload.push({
      //       id_product: resProduct.dataValues.id,
      //       id_metal_tone: productFile.tone,
      //       created_by: idAppUser,
      //       created_date: getLocalDate(),
      //       image_path: `${PRODUCT_FILE_LOCATION}/${product.sku}/${imagePath}`,
      //       image_type: PRODUCT_IMAGE_TYPE.Feature,
      //     });
      //   }
      //   if (productFile.iv_image) {
      //     for (path of productFile.iv_image) {
      //       const fileFormat = path.split('.').pop().toLowerCase();
      //     let imagePath;
      //     if (fileFormat === 'jpg' || fileFormat === 'jpeg' || fileFormat === 'png') {

      //       imagePath = path.replace(/\.[^.]+$/, '.webp')
      //     } else {
      //       imagePath = path
      //     }
      //       imgPayload.push({
      //         id_product: resProduct.dataValues.id,
      //         id_metal_tone: productFile.tone,
      //         created_by: idAppUser,
      //         created_date: getLocalDate(),
      //         image_path: `${PRODUCT_FILE_LOCATION}/${product.sku}/${imagePath}`,
      //         image_type: PRODUCT_IMAGE_TYPE.IV,
      //       });
      //     }
      //   }

      //   if (productFile.other_Images) {
      //     for (path of productFile.other_Images) {
      //       const fileFormat = path.split('.').pop().toLowerCase();
      //       let imagePath;
      //       if (fileFormat === 'jpg' || fileFormat === 'jpeg' || fileFormat === 'png') {

      //         imagePath = path.replace(/\.[^.]+$/, '.webp')
      //       } else {
      //         imagePath = path
      //       }

      //       imgPayload.push({
      //         id_product: resProduct.dataValues.id,
      //         id_metal_tone: productFile.tone,
      //         created_by: idAppUser,
      //         created_date: getLocalDate(),
      //         image_path: `${PRODUCT_FILE_LOCATION}/${product.sku}/${imagePath}`,
      //         image_type: PRODUCT_IMAGE_TYPE.Image,
      //       });
      //     }
      //   }

      //   for (path of productFile.video_file) {
      //     imgPayload.push({
      //       id_product: resProduct.dataValues.id,
      //       id_metal_tone: productFile.tone,
      //       created_by: idAppUser,
      //       created_date: getLocalDate(),
      //       image_path: `${PRODUCT_FILE_LOCATION}/${product.sku}/${path}`,
      //       image_type: PRODUCT_IMAGE_TYPE.Video,
      //     });
      //   }
      // }
      activityLogs.push(productDetails)
    }

    await ProductCategory.bulkCreate(pcPayload, {
      transaction: trn,
    });

    await ProductMetalOption.bulkCreate(pmoPayload, {
      transaction: trn,
    });
    await ProductDiamondOption.bulkCreate(pdoPayload, { transaction: trn });
    // await ProductImage.bulkCreate(imgPayload, { transaction: trn });
    await addActivityLogs(req,client_id,[{ old_data: null, new_data: activityLogs }], null, LogsActivityType.Add, LogsType.Product, idAppUser,trn)
    await trn.commit();
    // await refreshMaterializedProductListView(req.body.db_connection);
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};
