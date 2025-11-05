import {
  addActivityLogs,
  columnValueLowerCase,
  getLocalDate,
  prepareMessageFromParams,
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
  STONE_TYPE_NOT_FOUND,
  SUB_CATEGORY_NOT_FOUND,
  SUB_CATEGORY_REQUIRED_FOR_SUB_SUB_CATEGORY,
  SUB_SUB_CATEGORY_NOT_FOUND,
  TAG_IS_REQUIRES,
  UNPROCESSABLE_ENTITY_CODE,
  ZIP_NOT_FOUND,
} from "../../utils/app-messages";
import {
  ActiveStatus,
  BIRTHSTONE_STONE_TYPE,
  DeletedStatus,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  FeaturedProductStatus,
  IMAGE_TYPE,
  LogsActivityType,
  LogsType,
  PRODUCT_IMAGE_TYPE,
  PRODUCT_VIDEO_TYPE,
  STONE_TYPE,
  TrendingProductStatus,
} from "../../utils/app-enumeration";
import {
  DISCOUNT_TYPE_PLACE_ID,
  GENDERLIST,
  GET_BIRTHSTONE_DIAMOND_PLACE_ID_FROM_LABEL,
  GET_DIAMOND_PLACE_ID_FROM_LABEL,
  PRODUCT_FILE_LOCATION,
  PRODUCT_ZIP_LOCATION,
} from "../../utils/app-constants";
import {
  moveFileToLocation,
  moveFileToS3ByTypeAndLocation,
} from "../../helpers/file.helper";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import { Model, Op, Sequelize } from "sequelize";
import { initModels } from "../model/index.model";
const csv = require("csv-parser");
const readXlsxFile = require("read-excel-file/node");

export const addBirthstoneProductsFromCSVFile = async (req: Request) => {
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
  } catch (e) {}
  return errorDetail;
};

const processProductBulkUploadFile = async (
  id: number,
  path: string,
  idAppUser: number,
  clientId: number,
  req:any
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

const processCSVFile = async (path: string, idAppUser: number,client_id:number, req) => {
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
              category: row[1],
              sub_category: row[2],
              sub_sub_category: row[3],
              gemstone_count: row[4],
              engraving_count: row[5],
              name: row[6],
              glb_name: row[7],
              style_no: row[8],
              tag: row[9],
              sort_description: row[10],
              long_description: row[11],
              making_charge: row[12],
              finding_charge: row[13],
              other_charge: row[14],
              metal: row[15],
              karat: row[16],
              metal_tone: row[17],
              metal_weight: row[18],
              PLU_NO: row[19],
              price: row[20],
              stone_type: row[21],
              stone: row[22],
              shape: row[23],
              mm_size: row[24],
              color: row[25],
              clarity: row[26],
              cut: row[27],
              carat: row[28],
              stone_count: row[29],
              stone_cost: row[30],
              engraving_lable: row[31],
              engraving_character_count: row[32],
              discount_type: row[33],
              discount_value: row[34],
              image: row[35],
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
    "gemstone_count",
    "engraving_count",
    "name",
    "glb_name",
    "style_no",
    "tag",
    "sort_description",
    "long_description",
    "making_charge",
    "finding_charge",
    "other_charge",
    "metal",
    "karat",
    "metal_tone",
    "metal_weight",
    "PLU_NO",
    "price",
    "stone_type",
    "stone",
    "shape",
    "mm_size",
    "color",
    "clarity",
    "cut",
    "carat",
    "stone_count",
    "stone_cost",
    "engraving_lable",
    "engraving_character_count",
    "discount_type",
    "discount_value",
    "image",
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
  req: any
) => {
  if (fieldValue == null || fieldValue === "") {
    return "";
  }
  let valueList = fieldValue.toString().split("|");

  let findData = await model.findAll({
    where: {
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
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

const getProductsFromRows = async (rows: any,client_id:number,req:any) => {
  let currentProductIndex = -1;
  let productList = [];
  try {
    const {Tag} = initModels(req);

    let errors: {
      product_name: string;
      product_sku: string;
      error_message: string;
    }[] = [];
    for (const row of rows) {
      //const resSCI = await setCategoryId(productList);
      if (row.is_parent == "1") {
        currentProductIndex++;

        productList.push({
          gemstone_count: row.gemstone_count,
          engraving_count: row.engraving_count,
          glb_name: row.glb_name,
          style_no: row.style_no,

          name: row.name,
          sort_description: row.sort_description,
          long_description: row.long_description,
          making_charge: row.making_charge,
          finding_charge: row.finding_charge,
          other_charge: row.other_charge,
          discount_type: row.discount_type,
          discount_value: row.discount_value,
          image: row.image,
          tag: await getPipedIdFromFieldValue(Tag, row.tag, "name", req),
          product_categories: [],
          product_metal_options: [],
          product_diamond_options: [],
          product_engraving_option: [],
        });
        addProductDetailsToProductList(row, productList, currentProductIndex);
      } else if (row.is_parent == "0") {
        addProductDetailsToProductList(row, productList, currentProductIndex);
      }
    }

    const resSCI = await setCategoryId(productList,client_id, req);

    if (resSCI.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSCI.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const resSMO = await setMetalOptions(productList,client_id, req);
    if (resSMO.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      resSMO.data.map((t: any) =>
        errors.push({
          product_name: t.product_name,
          product_sku: t.product_sku,
          error_message: t.error_message,
        })
      );
    }

    const resSDO = await setDiamondOptions(productList,client_id, req);
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

    // console.log("resSFTresSFT", resSFT)
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
        PLU_NO: row.PLU_NO,
        price: row.price,
      });
    }
    if (row.stone_type && row.stone_type !== "") {
      productList[currentProductIndex].product_diamond_options.push({
        shape: row.shape,
        stone: row.stone,
        color: row.color,
        mm_size: row.mm_size,
        clarity: row.clarity,
        cut: row.cut,
        stone_type: row.stone_type,
        carat: row.carat,
        stone_count: row.stone_count,
        stone_cost: row.stone_cost,
        diamond_group_id: null,
      });
    }
    if (row.engraving_lable && row.engraving_lable !== "") {
      productList[currentProductIndex].product_engraving_option.push({
        engraving_lable: row.engraving_lable,
        engraving_character_count: row.engraving_character_count,
      });
    }
  }
};

const getPipedIdFromField = async (
  model: any,
  fieldValue: string,
  fieldName: string,
  client_id: number,
  req: Request
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
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      company_info_id :client_id
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

const setCategoryId = async (productList: any, client_id: number, req: any) => {
    const {CategoryData} = initModels(req);
  
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

  const categoryList = await CategoryData.findAll({
    where: {
      // category_name: { [Op.in]: categoryNameList },
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      company_info_id :client_id
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

const setMetalOptions = async (productList: any, client_id: number, req: any) => {
    const {MetalMaster, GoldKarat,MetalTone} = initModels(req);
  
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
  const metalList = await MetalMaster.findAll({
    where: {
      name: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("name")), {
        [Op.in]: configMetalNameList,
      }),
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      company_info_id :client_id
    },
  });
  const karatList = await GoldKarat.findAll({
    where: {
      name: { [Op.in]: configKaratNameList },
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      company_info_id :client_id
    },
  });

  const metalToneList = await MetalTone.findAll({
    where: {
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
      company_info_id :client_id
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

      console.log("metalList", metalList);

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
      const strMetalTone = await getIdFromName(
        metalTone,
        metalToneList,
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

const setDiamondOptions = async (productList: any, client_id: number, req: any) => {
    const {DiamondCaratSize, DiamondGroupMaster, DiamondShape, MMSizeData, StoneData, Colors, CutsData, ClarityData} = initModels(req);
  
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

      //Stone type should not be null

      // stone type center should be one

      if (productList[i].product_diamond_options[k].stone_type) {
        productList[i].product_diamond_options[k].stone_type =
          GET_BIRTHSTONE_DIAMOND_PLACE_ID_FROM_LABEL[
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
      (productList[i].product_diamond_options[k].stone = productList[i]
        .product_diamond_options[k].stone
        ? await getPipedIdFromField(
            StoneData,
            productList[i].product_diamond_options[k].stone,
            "name",
            client_id,
            req
          )
        : null),
        (productList[i].product_diamond_options[k].shape = productList[i]
          .product_diamond_options[k].shape
          ? await getPipedIdFromField(
              DiamondShape,
              productList[i].product_diamond_options[k].shape,
              "name",
            client_id,
          req)
          : null),
        (productList[i].product_diamond_options[k].mm_size = productList[i]
          .product_diamond_options[k].mm_size
          ? await getPipedIdFromField(
              MMSizeData,
              productList[i].product_diamond_options[k].mm_size.toString(),
              "value",
              client_id,
              req
            )
          : null),
        (productList[i].product_diamond_options[k].color = productList[i]
          .product_diamond_options[k].color
          ? await getPipedIdFromField(
              Colors,
              productList[i].product_diamond_options[k].color,
              "value",
              client_id,
              req
            )
          : null),
        (productList[i].product_diamond_options[k].clarity = productList[i]
          .product_diamond_options[k].clarity
          ? await getPipedIdFromField(
              ClarityData,
              productList[i].product_diamond_options[k].clarity,
              "value",
              client_id,
              req
            )
          : null),
        (productList[i].product_diamond_options[k].cut = productList[i]
          .product_diamond_options[k].cut
          ? await getPipedIdFromField(
              CutsData,
              productList[i].product_diamond_options[k].cut,
              "value",
              client_id,
              req
            )
          : null);
      productList[i].product_diamond_options[k].carat = productList[i]
        .product_diamond_options[k].carat
        ? await getPipedIdFromField(
            DiamondCaratSize,
            productList[i].product_diamond_options[k].cut,
            "value",
            client_id,
            req
          )
        : null;

      if (
        productList[i].product_diamond_options[k].stone_type ==
        BIRTHSTONE_STONE_TYPE.fixed
      ) {
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

        const diamondGroupMaster = await DiamondGroupMaster.findOne({
          where: {
            id_stone: productList[i].product_diamond_options[k].stone,
            id_shape: productList[i].product_diamond_options[k].shape,
            id_mm_size: productList[i].product_diamond_options[k].mm_size,
            id_color: productList[i].product_diamond_options[k].color,
            id_clarity: productList[i].product_diamond_options[k].clarity,
            id_cuts: productList[i].product_diamond_options[k].cut,
            id_carat: productList[i].product_diamond_options[k].carat,
            company_info_id :client_id
          },
        });

        if (diamondGroupMaster == null) {
          const diamondGroupMasterCreate: any = await DiamondGroupMaster.create(
            {
              id_stone: productList[i].product_diamond_options[k].stone,
              id_shape: productList[i].product_diamond_options[k].shape,
              id_mm_size: productList[i].product_diamond_options[k].mm_size,
              id_color: productList[i].product_diamond_options[k].color,
              id_clarity: productList[i].product_diamond_options[k].clarity,
              id_cuts: productList[i].product_diamond_options[k].cut,
              id_carat: productList[i].product_diamond_options[k].carat,
              rate: productList[i].product_diamond_options[k].stone_cost,
              created_date: getLocalDate(),
              is_active: ActiveStatus.Active,
              is_deleted: DeletedStatus.No,
              company_info_id :client_id
            }
          );

          productList[i].product_diamond_options[k].diamond_group_id =
            diamondGroupMasterCreate?.id;
        } else {
          productList[i].product_diamond_options[k].diamond_group_id =
            diamondGroupMaster?.dataValues.id;
        }
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

const addProductToDB = async (productlList: any, idAppUser: number, client_id: number, req: any) => {
  const {Image,BirthStoneProduct,BirthstoneProductEngraving, BirthStoneProductDiamondOption, BirthstoneProductMetalOption, BirthstoneProductCategory} = initModels(req);
  
  const trn = await (req.body.db_connection).transaction();
  let resProduct,
    productCategory,
    pmo,
    pdo,
    engraving,
    path,
    pcPayload: any = [],
    pmoPayload: any = [],
    pdoPayload: any = [],
    engravingPayload: any = [];

  try {
    let activitylogs: any = {}
    for (const product of productlList) {
      let imageResult: any;

      if (product.image) {
        imageResult = await Image.create(
          {
            image_path: `birthstone/${product.image}`,
            image_type: IMAGE_TYPE.BirthstoneProduct,
            created_by: idAppUser,
            company_info_id :client_id,
            created_date: getLocalDate(),
          },
          { transaction: trn }
        );
      }

      let slug = product.name.replaceAll(" ", "-").replaceAll(/['/|]/g, "-");

      const sameSlugCount = await BirthStoneProduct.count({
        where: [
          columnValueLowerCase("name", product.name),
          { is_deleted: DeletedStatus.No,company_info_id :client_id },
        ],
        transaction: trn,
      });

      if (sameSlugCount > 0) {
        slug = `${slug}-${sameSlugCount}`;
      }

      resProduct = await BirthStoneProduct.create(
        {
          name: product.name,
          sku: product.glb_name,
          sort_description: product.sort_description,
          long_description: product.long_description,
          tag: product.tag,
          slug: slug,
          product_image: imageResult ? imageResult.dataValues.id : null,
          making_charge: product.making_charge,
          finding_charge: product.finding_charge,
          other_charge: product.other_charge,
          product_number: product.glb_name,
          engraving_count: product.engraving_count,
          gemstone_count: product.gemstone_count,
          is_active: ActiveStatus.Active,
          is_featured: FeaturedProductStatus.InFeatured,
          is_trending: TrendingProductStatus.InTrending,
          created_by: idAppUser,
          company_info_id :client_id,
          created_date: getLocalDate(),
          style_no: product.style_no,
          is_deleted: DeletedStatus.No,
          discount_value: product.discount_value,
          discount_type:
            product.discount_type &&
            DISCOUNT_TYPE_PLACE_ID[product.discount_type.toLocaleLowerCase()],
        },
        { transaction: trn }
      );

      activitylogs = { ...resProduct.dataValues }

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
          company_info_id :client_id,
        });
      }

      for (pmo of product.product_metal_options) {
        pmoPayload.push({
          id_product: resProduct.dataValues.id,
          id_karat: pmo.karat == "" ? null : pmo.karat,
          id_metal_tone: pmo.metal_tone == "" ? null : pmo.metal_tone,
          metal_weight: pmo.metal_weight,
          id_metal: pmo.metal,
          plu_no: pmo.PLU_NO,
          price: pmo.price,
          created_by: idAppUser,
          created_date: getLocalDate(),
          is_active: ActiveStatus.Active,
          is_deleted: DeletedStatus.No,
          company_info_id :client_id
        });
      }

      for (pdo of product.product_diamond_options) {
        pdoPayload.push({
          id_product: resProduct.dataValues.id,
          id_diamond_group: pdo.diamond_group_id ? pdo.diamond_group_id : null,
          id_type: pdo.stone_type,
          count: pdo.stone_count,
          created_date: getLocalDate(),
          created_by: idAppUser,
          id_stone: pdo.stone,
          id_shape: pdo.shape,
          id_mm_size: pdo.mm_size,
          id_color: pdo.color,
          id_clarity: pdo.clarity,
          id_carat: pdo.carat,
          id_cut: pdo.cut,
          company_info_id :client_id,
        });
      }

      for (engraving of product.product_engraving_option) {
        engravingPayload.push({
          id_product: resProduct.dataValues.id,
          text: engraving.engraving_lable,
          max_text_count: engraving.engraving_character_count,
          created_date: getLocalDate(),
          is_deleted: DeletedStatus.No,
          created_by: idAppUser,
          company_info_id :client_id,
        });
      }
    }

    // console.log("pdoPayload", pdoPayload);

    const categorydata = await BirthstoneProductCategory.bulkCreate(pcPayload, { transaction: trn });
    activitylogs = { ...activitylogs,category: [ ...categorydata] }

    const birthstoneProductMetalOption = await BirthstoneProductMetalOption.bulkCreate(pmoPayload, {
      transaction: trn,
    });
    activitylogs = { ...activitylogs,metals: [ ...birthstoneProductMetalOption] }

    const birthStoneProductDiamondOption = await BirthStoneProductDiamondOption.bulkCreate(pdoPayload, {
      transaction: trn,
    });

    activitylogs = { ...activitylogs,diamond: [ ...birthStoneProductDiamondOption] }

    const birthstoneProductEngraving = await BirthstoneProductEngraving.bulkCreate(engravingPayload, {
      transaction: trn,
    });
    activitylogs = { ...activitylogs,engraving: [ ...birthstoneProductEngraving] }

    await addActivityLogs(client_id,[{
      old_data: null,
      new_data: activitylogs
    }], resProduct?.dataValues?.id, LogsActivityType.Add, LogsType.BirthStoneProductBulkUpload, idAppUser,trn)
              
    await trn.commit();
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    return resUnknownError({ data: e });
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
      return resSuccess();
    } catch (e) {
      await trn.rollback();
      return resUnknownError({ data: e });
    }
  } catch (e) {
    return resUnknownError({ data: e });
  }
};
