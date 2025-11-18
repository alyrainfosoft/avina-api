import { Request } from "express";
import {
  addActivityLogs,
  getLocalDate,
  resSuccess,
  resUnknownError,
  resUnprocessableEntity,
} from "../../utils/shared-functions";
import {
  DEFAULT_STATUS_CODE_SUCCESS,
  FILE_NOT_FOUND,
  INVALID_HEADER,
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE_ERROR_MESSAGE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE_ERROR_MESSAGE,
} from "../../utils/app-messages";
import {
  PRODUCT_BULK_UPLOAD_FILE_MIMETYPE,
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  PRODUCT_CSV_FOLDER_PATH,
} from "../../config/env.var";
import { moveFileToLocation } from "../../helpers/file.helper";
import {
  FILE_BULK_UPLOAD_TYPE,
  FILE_STATUS,
  LogsActivityType,
  LogsType,
} from "../../utils/app-enumeration";
import { TResponseReturn } from "../../data/interfaces/common/common.interface";
import { LOG_FOR_SUPER_ADMIN } from "../../utils/app-constants";
import { initModels } from "../model/index.model";
const readXlsxFile = require("read-excel-file/node");
export const addRoleAPIPermissionCSVFile = async (req: Request) => {
  try {
    const { ProductBulkUploadFile } = initModels(req);
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

    const resPDBUF = await processRoleAPIPermissionBulkUploadFile(
      resPBUF.dataValues.id,
      resMFTL.data,
      req.body.session_res.id_app_user,
      req?.body?.session_res?.client_id,
      req
    );

    return resSuccess({ data: resPDBUF });
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
const processRoleAPIPermissionBulkUploadFile = async (
  id: number,
  path: string,
  idAppUser: number,
  clientId: number,
  req: Request
) => {
  const { ProductBulkUploadFile } = initModels(req);
  try {
    const data = await processCSVFile(path, idAppUser,clientId, req);
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
    } catch (e) {}
  }
};
const getArrayOfRowsFromCSVFile = async (path: string,client_id:number) => {
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
              id_menu_item: row[0],
              id_action: row[1],
              api_endpoint: row[2],
              http_method: row[3],
              company_info_id :client_id,
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
const processCSVFile = async (path: string, idAppUser: number,clientId:number, req: Request) => {
  try {
    const resRows = await getArrayOfRowsFromCSVFile(path,clientId);
    if (resRows.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resRows;
    }

    const resVH = await validateHeaders(resRows.data.headers);
    if (resVH.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resVH;
    }

    const resAPTD = await addGroupToDB(resRows.data.results, idAppUser, req);
    if (resAPTD.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resAPTD;
    }

    return resSuccess({ data: resAPTD.data });
  } catch (e) {
    throw e;
  }
};

const validateHeaders = async (headers: string[]) => {
  const DIAMOND_GROUP_BULK_UPLOAD_HEADERS = [
    "id_menu_item",
    "id_action",
    "api_endpoint",
    "http_method",
  ];

  let errors: {
    row_id: number;
    column_id: number;
    column_name: string;
    error_message: string;
  }[] = [];
  let i;
  for (i = 0; i < headers.length; i++) {
    if (headers[i].trim() != DIAMOND_GROUP_BULK_UPLOAD_HEADERS[i]) {
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

const addGroupToDB = async (list: any, idAppUser: number, req: Request) => {
  try {
    const { RoleApiPermission } = initModels(req);
    const data = await RoleApiPermission.bulkCreate(list);
    await addActivityLogs(req,LOG_FOR_SUPER_ADMIN,[{
      old_data: null,
      new_data: {
        data:data.map((t)=>t.dataValues),
      }
    }], null, LogsActivityType.Add, LogsType.ProductReview,idAppUser)
  
    return resSuccess({ data: data });
  } catch (e) {
    console.log("eeeeeeeeee", e);

    throw e;
  }
};
