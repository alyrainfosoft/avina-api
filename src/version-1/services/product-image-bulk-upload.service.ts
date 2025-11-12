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
import { s3UploadObject } from "../../helpers/s3-client.helper";
import { initModels } from "../model/index.model";
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
export const addProductImageCSVFile = async (req: Request) => {
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

    const resPDBUF = await processProductImageBulkUploadFile(
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

const processProductImageBulkUploadFile = async (
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
    } catch (e) {}
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

const processCSVFile = async (path: string, idAppUser: number,clientId:any, req: Request) => {
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

    const resProducts = await getImageUploadRows(resRows.data.results,idAppUser,clientId, req);
    if (resProducts.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return resProducts;
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
              product_sku: row[0],
              image: row[1],
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

const validateHeaders = async (headers: string[]) => {
  const DIAMOND_GROUP_BULK_UPLOAD_HEADERS = ["product_sku", "image"];

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

const getImageUploadRows = async (rows: any,idAppUser:any,client_id:any, req: Request) => {
  let currentGroupIndex = -1;
  let diamondGroupList = [];

  try {
    let errors: {
      row_id: number;
      error_message: string;
    }[] = [];
    const activitylogs = [];
    for (const row of rows) {
      if (
        row.product_sku != null ||
        row.product_sku != "" ||
        row.image != null ||
        row.image != "" ||
        row.image != "none"
      ) {
        const imagePath = path.join(
          "D:",
          "khushi",
          "pictures",
          "New folder",
          "Individual Picture",
          `${row.image}.jpg`
        );

        let fileStream = await fs.readFileSync(imagePath);

        const value = await sharp(fileStream).webp({ quality: 50 }).toBuffer();

        const data = await s3UploadObject(
          req.body.db_connection,
          value,
          `products/${row.product_sku}/${row.image}.webp`,
          "image/webp",
          client_id
        );
        if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          errors.push({
            row_id: rows.indexOf(row) + 1,
            error_message: data.message,
          });
        }
        activitylogs.push(...data);
      }
    }

    if (errors.length > 0) {
      return resUnprocessableEntity({ data: errors });
    }
  await addActivityLogs(req,client_id,[{
          old_data: null,
          new_data: activitylogs}], null, LogsActivityType.Add, LogsType.ProductImageBulkUpload, idAppUser)
        
    return resSuccess({ data: diamondGroupList });
  } catch (e) {
    console.log("e", e);
    throw e;
  }
};
