import { Request } from "express";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  ERROR_NOT_FOUND,
  FILE_NOT_FOUND,
  INVALID_HEADER,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
  REQUIRED_ERROR_MESSAGE,
} from "../../../../utils/app-messages";
import {
  addActivityLogs,
  getLocalDate,
  prepareMessageFromParams,
  refreshAllMaterializedView,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../../../utils/shared-functions";
import {
  PRODUCT_BULK_UPLOAD_BATCH_SIZE,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../../../config/env.var";
import { moveFileToLocation } from "../../../../helpers/file.helper";
import ProductBulkUploadFile from "../../../model/product-bulk-upload-file.model";
import {
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  LogsActivityType,
  LogsType,
} from "../../../../utils/app-enumeration";
import { TResponseReturn } from "../../../../data/interfaces/common/common.interface";
import { Op } from "sequelize";
import StoneData from "../../../model/master/attributes/gemstones.model";
import CutsData from "../../../model/master/attributes/cuts.model";
import ClarityData from "../../../model/master/attributes/clarity.model";
import Colors from "../../../model/master/attributes/colors.model";
import DiamondShape from "../../../model/master/attributes/diamondShape.model";
import MMSizeData from "../../../model/master/attributes/mmSize.model";
import DiamondCaratSize from "../../../model/master/attributes/caratSize.model";
import SieveSizeData from "../../../model/master/attributes/seiveSize.model";
import DiamondGroupMaster from "../../../model/master/attributes/diamond-group-master.model";
import dbContext from "../../../../config/db-context";
import { LOG_FOR_SUPER_ADMIN } from "../../../../utils/app-constants";
const readXlsxFile = require("read-excel-file/node");
export const addDiamondGroupMasterWithRangeFromCSVFile = async (
  req: Request
) => {
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
      file_type: FILE_BULK_UPLOAD_TYPE.DiamondGroupUpload,
      created_by: req.body.session_res.id_app_user,
      created_date: getLocalDate(),
    });

    const resPDBUF = await processDiamondGroupBulkUploadFile(
      resPBUF.dataValues.id,
      resMFTL.data,
      req.body.session_res.id_app_user,
      req
    );

    return resPDBUF;
  } catch (e) {
    return resUnknownError({ data: e });
  }
};

const processDiamondGroupBulkUploadFile = async (
  id: number,
  path: string,
  idAppUser: number,
  req:any
) => {
  try {
    const data = await processCSVFile(path, idAppUser,req);
    console.log("datas", data);
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
    console.log("datas", e);

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

    //   if (resRows.data.batchSize > PRODUCT_BULK_UPLOAD_BATCH_SIZE) {
    //     return resUnprocessableEntity({
    //       message: PRODCUT_BULK_UPLOAD_BATCH_SIZE_ERROR_MESSAGE,
    //     });
    //   }

    const resProducts = await getDiamondGroupFromRows(resRows.data.results);
    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addGroupToDB(resProducts.data, idAppUser,req);
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
              stone: row[0],
              shape: row[1],
              seive_size: row[2],
              mm_size: row[3],
              carat: row[4],
              color: row[5],
              clarity: row[6],
              cuts: row[7],
              min_carat_range: row[8],
              max_carat_range: row[9],
              natural_rate: row[10],
              synthetic_rate: row[11],
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

      // const fileContent = fs.readFileSync(path, { encoding: 'utf-8' });
      // console.log("fileContent", fileContent);

      // fs.createReadStream(path)
      //   .pipe(csv())
      //   .on("data", (data: any) => {

      //       batchSize++;
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

const getIdFromName = (name: string, list: any, fieldName: string) => {
  if (name == "" || !name || name == null || name == undefined) {
    return "0";
  }

  let findItem = list.find(
    (item: any) =>
      item.dataValues[fieldName].trim().toLocaleLowerCase() ==
      name.toString().trim().toLocaleLowerCase()
  );

  return findItem ? parseInt(findItem.dataValues.id) : "0";
};

const getPipedIdFromFieldValue = async (
  model: any,
  fieldValue: string,
  fieldName: string
) => {
  if (fieldValue === "") {
    return "";
  }
  let valueList = fieldValue.split("|");
  let findData = await model.findAll({
    where: {
      [fieldName]: { [Op.in]: valueList },
      is_deleted: "0",
      is_active: "1",
    },
  });
  let idList = [];
  for (const tag of findData) {
    idList.push(tag.dataValues.id);
  }
  return idList.join("|");
};

const validateHeaders = async (headers: string[]) => {
  const DIAMOND_GROUP_BULK_UPLOAD_HEADERS = [
    "stone",
    "shape",
    "seive_size",
    "mm_size",
    "carat",
    "color",
    "clarity",
    "cuts",
    "min_carat_range",
    "max_carat_range",
    "natural_rate",
    "synthetic_rate",
  ];

  let errors: {
    row_id: number;
    column_id: number;
    column_name: string;
    error_message: string;
  }[] = [];
  let i;
  for (i = 0; i < headers.length; i++) {
    if (
      !headers[i] ||
      (headers[i] &&
        headers[i].toString().trim() != DIAMOND_GROUP_BULK_UPLOAD_HEADERS[i])
    ) {
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

const getDiamondGroupFromRows = async (rows: any) => {
  let currenGroupIndex = -1;
  let diamondGroupList = [];
  let where = [{ is_deleted: "0" }, { is_active: "1" }];

  const stoneList = await StoneData.findAll({
    where,
    attributes: ["id", "name", "slug", "gemstone_type"],
  });

  const stone_cut = await CutsData.findAll({
    where,
    attributes: ["id", "value", "slug"],
  });

  const stone_clarity = await ClarityData.findAll({
    where,
    attributes: ["id", "value", "name", "slug"],
  });

  const stone_color = await Colors.findAll({
    where,
    attributes: ["id", "value", "name", "slug"],
  });

  const stone_shape = await DiamondShape.findAll({
    where,
    attributes: ["id", "name", "slug"],
  });

  const MM_Size = await MMSizeData.findAll({
    where,
    attributes: ["id", "value", "slug"],
  });

  const carat_size = await DiamondCaratSize.findAll({
    where,
    attributes: ["id", "value", "slug"],
  });
  const seive_size = await SieveSizeData.findAll({
    where,
    attributes: ["id", "value", "slug"],
  });

  try {
    let errors: {
      row_id: number;
      error_message: string;
    }[] = [];

    for (const row of rows) {
      currenGroupIndex++;

      if (row.shape == null) {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Shape"],
          ]),
        });
      }

      if (row.stone == null) {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Stone"],
          ]),
        });
      }

      if (row.carat == null) {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Carat"],
          ]),
        });
      }
      const stone = getIdFromName(row.stone, stoneList, "name");

      const diamondShape = getIdFromName(row.shape, stone_shape, "name");
      const mmSize = row.mm_size
        ? getIdFromName(row.mm_size.toString(), MM_Size, "value")
        : null;
      const color = row.color
        ? getIdFromName(row.color, stone_color, "value")
        : null;
      const clarity = row.clarity
        ? getIdFromName(row.clarity, stone_clarity, "value")
        : null;
      const cut = row.cuts ? getIdFromName(row.cuts, stone_cut, "value") : null;
      const carat = row.carat
        ? getIdFromName(row.carat, carat_size, "value")
        : null;
      const seiveSizeValue = row.seive_size
        ? getIdFromName(row.seive_size.replaceAll("'", ""), seive_size, "value")
        : null;

      if (row.stone && stone == "0") {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(ERROR_NOT_FOUND, [
            ["field_name", "Stone"],
          ]),
        });
      }

      if (row.shape && diamondShape == "0") {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(ERROR_NOT_FOUND, [
            ["field_name", "Shape"],
          ]),
        });
      }

      if (seiveSizeValue == "0") {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(ERROR_NOT_FOUND, [
            ["field_name", "sieve Size"],
          ]),
        });
      }

      if (row.carat && carat == "0") {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(ERROR_NOT_FOUND, [
            ["field_name", "Carat"],
          ]),
        });
      }

      if (mmSize == "0") {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(ERROR_NOT_FOUND, [
            ["field_name", "mm Size"],
          ]),
        });
      }

      if (cut == "0") {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(ERROR_NOT_FOUND, [
            ["field_name", "Cut"],
          ]),
        });
      }

      if (color == "0") {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(ERROR_NOT_FOUND, [
            ["field_name", "Color"],
          ]),
        });
      }

      if (clarity == "0") {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(ERROR_NOT_FOUND, [
            ["field_name", "Clarity"],
          ]),
        });
      }

      const diamondGroup = await DiamondGroupMaster.findOne({
        where: {
          is_deleted: "0",
          id_stone: stone,
          id_shape: diamondShape,
          id_mm_size: mmSize,
          id_color: color,
          id_clarity: clarity,
          id_cuts: cut,
          id_carat: carat,
          id_seive_size: seiveSizeValue,
        },
      });

      diamondGroupList.push({
        group_id: diamondGroup != null ? diamondGroup.dataValues.id : 0,
        stone: stone,
        shape: diamondShape,
        mm_size: mmSize,
        color: color,
        clarity: clarity,
        cut: cut,
        carat: carat,
        seive_size: seiveSizeValue,
        rate: row.natural_rate,
        min_carat_range: row.min_carat_range ? row.min_carat_range : null,
        max_carat_range: row.max_carat_range ? row.max_carat_range : null,
        synthetic_rate: row.synthetic_rate,
        old_data: diamondGroup.dataValues
      });
    }

    if (errors.length > 0) {
      return resUnprocessableEntity({ data: errors });
    }

    return resSuccess({ data: diamondGroupList });
  } catch (e) {
    console.log("e", e);
    throw e;
  }
};

const addGroupToDB = async (list: any, idAppUser: any,req:any) => {
  const trn = await dbContext.transaction();
  let pcPayloadAdd: any = [];
  try {
    let activityLogs = []
    for (const group of list) {
      if (
        group.group_id &&
        group.group_id != undefined &&
        group.group_id != null &&
        group.group_id != 0
      ) {
        //Update
        const data = {
          id_stone: group.stone,
          id_shape: group.shape,
          id_mm_size: group.mm_size,
          id_color: group.color,
          id_clarity: group.clarity,
          id_cuts: group.cut && group.cut,
          id_carat: group.carat,
          id_seive_size: group.seive_size,
          rate: group.rate,
          synthetic_rate: group.synthetic_rate,
          min_carat_range: group.min_carat_range,
          max_carat_range: group.max_carat_range,
          modified_date: getLocalDate(),
          modified_by: idAppUser
        }
        await DiamondGroupMaster.update(
          data,
          { where: { id: group.group_id } }
        );
        activityLogs.push({ old_data: group.old_data, new_data: { ...group.old_data, ...data } })
      } else {
        pcPayloadAdd.push({
          id_stone: group.stone,
          id_shape: group.shape,
          id_mm_size: group.mm_size,
          id_color: group.color,
          id_clarity: group.clarity,
          id_cuts: group.cut && group.cut,
          id_carat: group.carat,
          id_seive_size: group.seive_size,
          rate: group.rate,
          synthetic_rate: group.synthetic_rate,
          min_carat_range: group.min_carat_range,
          max_carat_range: group.max_carat_range,
          is_deleted: "0",
          is_active: "1",
          created_date: getLocalDate(),
          created_by: idAppUser

        });
      }
    }
    const data = await DiamondGroupMaster.bulkCreate(pcPayloadAdd, { transaction: trn });
    for (let index = 0; index < data.length; index++) {
      const element = data[index].dataValues;
      activityLogs.push({ old_data: null, new_data: element })
    }
    await addActivityLogs(req, LOG_FOR_SUPER_ADMIN,activityLogs, null, LogsActivityType.Edit, LogsType.DiamondGroupMater, idAppUser)
    await trn.commit();
    await refreshAllMaterializedView(dbContext);
    return resSuccess();
  } catch (e) {
    await trn.rollback();
    throw e;
  }
};
