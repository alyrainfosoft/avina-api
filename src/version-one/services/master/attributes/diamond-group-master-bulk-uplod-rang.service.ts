import { Request } from "express";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  DIAMOND_GROUP_MASTER_RANGE_VALIDATION,
  DIAMOND_GROUP_MASTER_RATE_SYNTHETIC_RATE_VALIDATION,
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
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../../../config/env.var";
import { moveFileToLocation } from "../../../../helpers/file.helper";
import {
  ActiveStatus,
  DeletedStatus,
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  LogsActivityType,
  LogsType,
} from "../../../../utils/app-enumeration";
import { TResponseReturn } from "../../../../data/interfaces/common/common.interface";
import { Op } from "sequelize";
import { initModels } from "../../../model/index.model";

const readXlsxFile = require("read-excel-file/node");
export const addDiamondGroupMasterWithRangeFromCSVFile = async (
  req: Request
) => {
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
      file_type: FILE_BULK_UPLOAD_TYPE.DiamondGroupUpload,
      created_by: req.body.session_res.id_app_user,
      company_info_id :req?.body?.session_res?.client_id,
      created_date: getLocalDate(),
    });

    const resPDBUF = await processDiamondGroupBulkUploadFile(
      resPBUF.dataValues.id,
      resMFTL.data,
      req.body.session_res.id_app_user,
      req?.body?.session_res?.client_id,
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
  clientId: any,
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

const processCSVFile = async (path: string, idAppUser: number,client_id:any, req: Request) => {
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

    const resProducts = await getDiamondGroupFromRows(resRows.data.results,client_id,req);
    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
    }

    const resAPTD = await addGroupToDB(resProducts.data, idAppUser,client_id, req);
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
              min_carat_range: row[5],
              max_carat_range: row[6],
              average_carat: row[7],
              color: row[8],
              clarity: row[9],
              cuts: row[10],
              natural_rate: row[11],
              synthetic_rate: row[12],
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
      is_deleted: DeletedStatus.No,
      is_active: ActiveStatus.Active,
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
    "min_carat_range",
    "max_carat_range",
    "average_carat",
    "color",
    "clarity",
    "cuts",
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
    console.log(headers[i]);
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

const getDiamondGroupFromRows = async (rows: any,client_id:any, req: Request) => {
  let currenGroupIndex = -1;
  let diamondGroupList = [];
  const {StoneData, CutsData, ClarityData, Colors, DiamondShape, MMSizeData, DiamondCaratSize, SieveSizeData, DiamondGroupMaster} = initModels(req);
  let where = [{ is_deleted: DeletedStatus.No }, { is_active: ActiveStatus.Active }, {company_info_id:client_id}];

  const stoneList = await StoneData.findAll({
    where,
    attributes: ["id", "name", "slug", "gemstone_type", "is_diamond"],
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
      } else {
        const findStone = stoneList.find(
          (item: any) => item.dataValues.id == stone
        );

        if (findStone && findStone.dataValues.is_diamond == 1 && color == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Color"],
            ]),
          });
        }
        if (findStone && findStone.dataValues.is_diamond == 1 && clarity == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Clarity"],
            ]),
          });
        }
        if (findStone && findStone.dataValues.is_diamond == 2 && mmSize == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "MM Size"],
            ]),
          });
        }
        if (findStone && findStone.dataValues.is_diamond == 2 && cut == null) {
          errors.push({
            row_id: currenGroupIndex + 1 + 1,
            error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
              ["field_name", "Cut"],
            ]),
          });
        }
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

      if (row.mm_size && row.mm_size !== "" && mmSize == "0") {
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

      if (row.min_carat_range == null) {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Min Carat Range"],
          ]),
        });
      }

      if (row.max_carat_range == null) {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: prepareMessageFromParams(REQUIRED_ERROR_MESSAGE, [
            ["field_name", "Max Carat Range"],
          ]),
        });
      }

      if(row.natural_rate == null && row.synthetic_rate == null) {
        errors.push({
          row_id: currenGroupIndex + 1 + 1,
          error_message: DIAMOND_GROUP_MASTER_RATE_SYNTHETIC_RATE_VALIDATION,
        });
      }

      const diamondGroup = await DiamondGroupMaster.findOne({
        where: [
          {is_deleted: DeletedStatus.No},
          {id_stone: stone},
          { id_shape: diamondShape },
          { id_color: color },
          { id_clarity: clarity },
          { id_cuts: cut },
          {id_carat: carat},
          {company_info_id:client_id}
        ],
      });

      //  const sameRangeDiamondGroup = await DiamondGroupMaster.findOne({
      // where: [
      //   diamondGroup != null ? {id: { [Op.ne]: diamondGroup?.dataValues?.id }} : {} ,
      //   {id_stone: stone},
      //   {id_shape: diamondShape},
      //   { id_color: color },
      //   { id_clarity: clarity },
      //   { id_cuts: cut },
      //   {is_deleted: DeletedStatus.No},
      //   {company_info_id: client_id},
      //   {[Op.and]: [
      //     {
      //       min_carat_range: { [Op.lt]: row.max_carat_range }
      //     },
      //     {
      //       max_carat_range: { [Op.gt]: row.min_carat_range }
      //     }
      //   ]}
      // ]
      // });

      // if (sameRangeDiamondGroup != null) {
      //   errors.push({
      //     row_id: currenGroupIndex + 1 + 1,
      //     error_message: DIAMOND_GROUP_MASTER_RANGE_VALIDATION,
      //   });
      // }
      diamondGroupList.push({
        group_id: diamondGroup != null ? diamondGroup?.dataValues?.id : 0,
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
        average_carat: row.average_carat ? row.average_carat : null,
        synthetic_rate: row.synthetic_rate,
        old_data: diamondGroup?.dataValues
      });
    }

    if (errors.length > 0) {
      return resUnprocessableEntity({ data: errors });
    }

    return resSuccess({ data: diamondGroupList });
  } catch (e) {
    throw e;
  }
};

const addGroupToDB = async (list: any, idAppUser: any, client_id: any, req: Request) => {
  const{DiamondGroupMaster} = initModels(req);
  const trn = await (req.body.db_connection).transaction();
  let pcPayloadAdd: any = [];
  try {
    let editActivityLogs:any = [];
    let newAddActivityLogs:any = [];
    for (const group of list) {
      if (
        group.group_id &&
        group.group_id != undefined &&
        group.group_id != null &&
        group.group_id != 0
      ) {
        //Update
        let data:any = {
          id_stone: group.stone,
          id_shape: group.shape,
          id_mm_size: group.mm_size,
          id_color: group.color,
          id_clarity: group.clarity,
          id_cuts: group.cut && group.cut,
          id_carat: group.carat,
          id_seive_size: group.seive_size,
          rate: group.rate,
          average_carat: group.average_carat,
          synthetic_rate: group.synthetic_rate,
          min_carat_range: group.min_carat_range,
          max_carat_range: group.max_carat_range,
          modified_date: getLocalDate(),
          modified_by: idAppUser
        }
        await DiamondGroupMaster.update(
          data,
          { where: { id: group.group_id,company_info_id: client_id } }
        );
        data.id = group.group_id;
        editActivityLogs.push({ old_data: { diamond_group_master_id:group.group_id, data:{...group.old_data}}, new_data: { diamond_group_master_id:data.id, data: {...data} } })
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
          average_carat: group.average_carat,
          synthetic_rate: group.synthetic_rate,
          min_carat_range: group.min_carat_range,
          max_carat_range: group.max_carat_range,
          is_deleted: DeletedStatus.No,
          is_active: ActiveStatus.Active,
          created_date: getLocalDate(),
          created_by: idAppUser,
          company_info_id: client_id
        });
      }
    }
    await addActivityLogs(req,client_id,editActivityLogs, null, LogsActivityType.Edit, LogsType.DiamondGroupMater, idAppUser,trn);
    const data = await DiamondGroupMaster.bulkCreate(pcPayloadAdd, { transaction: trn });
    for (let index = 0; index < data.length; index++) {
      const element = data[index].dataValues;
      newAddActivityLogs.push({ old_data: null, new_data: {...element} })
    }
    await addActivityLogs(req,client_id,newAddActivityLogs, null, LogsActivityType.Add, LogsType.DiamondGroupMater, idAppUser,trn);
    await trn.commit();
    await refreshAllMaterializedView(req.body.db_connection);
    return resSuccess();
  } catch (e) {
    console.log(e);
    await trn.rollback();
    throw e;
  }
};
