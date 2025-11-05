import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import {
  PRODUCT_BULK_UPLOAD_FILE_SIZE,
  STORE_TEMP_FILE_PATH,
  STORE_TEMP_VIDEO_PATH,
} from "../config/env.var";
import { createFolderIfNot } from "../helpers/file.helper";
import { DEFAULT_STATUS_CODE_ERROR } from "../utils/app-messages";
import {
  generateRandomString,
  getCryptoRandomUUID,
  getLocalDate,
  resUnknownError,
} from "../utils/shared-functions";

const upload = (options?: multer.Options) =>
  multer(
    {
      //   storage: multer.diskStorage({
      //     destination: function (req, file, cb) {
      //       cb(null, destinationPath);
      //     },
      //     filename: function (_req, file, cb) {
      //       const imagePath = file.originalname
      //         .replace(/\s|\(|\)/g, "_")
      //         .replace(/\.[^/.]+$/, "");
      //       const ext = path.extname(file.originalname);

      //       cb(
      //         null,
      //         imagePath.toLocaleLowerCase() + "-" + genrerateRandomString(32) + ext
      //       );
      //     },
      //   }
      // ),
      limits: options?.limits,
    });
const uploadAllValue = multer().any();
export const reqSingleImageParser =
  (field_name: string): RequestHandler =>
    (req, res, next) => {
      try {
        const session_res = req.body.session_res;
        const db_connection = req.body.db_connection;
        upload().single(field_name)(req, res, (err) => {
          if (err) {
            return res
              .status(DEFAULT_STATUS_CODE_ERROR)
              .send(resUnknownError({ data: err }));
          }
          req.body["session_res"] = session_res;
          req.body["db_connection"] = db_connection;
          return next();
        });
      } catch (e) {
        return res
          .status(DEFAULT_STATUS_CODE_ERROR)
          .send(resUnknownError({ data: e }));
      }
    };

export const reqMultiImageParser =
  (fieldArray: string[]): RequestHandler =>
    (req, res, next) => {
      try {
        const session_res = req.body.session_res;
        const db_connection = req.body.db_connection;
        upload().fields(
          fieldArray.map((name) => ({ name, maxCount: 1 }))
        )(req, res, (err) => {
          if (err) {
            return res
              .status(DEFAULT_STATUS_CODE_ERROR)
              .send(resUnknownError({ data: err }));
          }
          req.body["session_res"] = session_res;
          req.body["db_connection"] = db_connection;

          return next();
        });
      } catch (e) {
        return res
          .status(DEFAULT_STATUS_CODE_ERROR)
          .send(resUnknownError({ data: e }));
      }
    };

    
const onlyFileUpload = (destinationPath:any, options?: multer.Options) =>
  multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, destinationPath);
      },
      filename: function (_req, file, cb) {
        const imagePath = file.originalname
          .replace(/\s|\(|\)/g, "_")
          .replace(/\.[^/.]+$/, "");
        const ext = path.extname(file.originalname);

        cb(
          null,
          imagePath.toLocaleLowerCase() + "-" + generateRandomString(32) + ext
        );
      },
    }),
    limits: options?.limits,
  });

export const reqProductBulkUploadFileParser =
  (field_name: string): RequestHandler =>
    (req, res, next) => {
      try {
        const session_res = req.body.session_res;
        const db_connection = req.body.db_connection;
        onlyFileUpload(STORE_TEMP_FILE_PATH,{
          limits: { fileSize: PRODUCT_BULK_UPLOAD_FILE_SIZE * 1000 * 1000 },
        }).single(field_name)(req, res, (err) => {
          if (err) {
            return res
              .status(DEFAULT_STATUS_CODE_ERROR)
              .send(resUnknownError({ data: err }));
          }
          req.body["session_res"] = session_res;
          req.body["db_connection"] = db_connection;

          return next();
        });
      } catch (e) {
        return res
          .status(DEFAULT_STATUS_CODE_ERROR)
          .send(resUnknownError({ data: e }));
      }
    };

export const reqProductBulkZipFileParser =
  (field_name: string): RequestHandler =>
    (req, res, next) => {
      try {
        const session_res = req.body.session_res;
        const db_connection = req.body.db_connection;
        createFolderIfNot(STORE_TEMP_FILE_PATH);
        upload().single(field_name)(req, res, (err) => {
          console.log("err", err);
          //Check below code why it's not working

          // if (err) {
          //   return res
          //     .status(DEFAULT_STATUS_CODE_ERROR)
          //     .send(resUnknownError({ data: err }));
          // }
          req.body["session_res"] = session_res;
          req.body["db_connection"] = db_connection;

          return next();
        });
      } catch (e) {
        console.log("e", e);
        return res
          .status(DEFAULT_STATUS_CODE_ERROR)
          .send(resUnknownError({ data: e }));
      }
    };

export const reqArrayImageParser =
  (fieldArray: string[]): RequestHandler =>
    (req, res, next) => {
      try {
        const session_res = req.body.session_res;
        const db_connection = req.body.db_connection;
        upload().fields(
          fieldArray.map((name) => ({ name }))
        )(req, res, (err) => {
          if (err) {
            return res
              .status(DEFAULT_STATUS_CODE_ERROR)
              .send(resUnknownError({ data: err }));
          }
          req.body["session_res"] = session_res;
          req.body["db_connection"] = db_connection;

          return next();
        });
      } catch (e) {
        return res
          .status(DEFAULT_STATUS_CODE_ERROR)
          .send(resUnknownError({ data: e }));
      }
    };

export const reqArrayVideoParser =
  (fieldArray: string[]): RequestHandler =>
    (req, res, next) => {
      try {
        const session_res = req.body.session_res;
        const db_connection = req.body.db_connection;
        console.log("here");
        upload().fields(
          fieldArray.map((name) => ({ name }))
        )(req, res, (err) => {
          if (err) {
            return res
              .status(DEFAULT_STATUS_CODE_ERROR)
              .send(resUnknownError({ data: err }));
          }
          req.body["session_res"] = session_res;
          req.body["db_connection"] = db_connection;

          return next();
        });
      } catch (e) {
        return res
          .status(DEFAULT_STATUS_CODE_ERROR)
          .send(resUnknownError({ data: e }));
      }
    };

export const reqAnyTypeImageAnyFormat = () => (req, res, next) => {
  try {
    const session_res = req.body.session_res;
    const db_connection = req.body.db_connection;
    uploadAllValue(req, res, (err: any) => {
      if (err) {
        return res
          .status(DEFAULT_STATUS_CODE_ERROR)
          .send(resUnknownError({ data: err }));
      }

      // Preserve session_res if it exists
      if (session_res) {

        req.body["session_res"] = session_res;
        req.body["db_connection"] = db_connection;

      }

      next();
    });
  } catch (e) {
    return res
      .status(DEFAULT_STATUS_CODE_ERROR)
      .send(resUnknownError({ data: e }))
  }
};
