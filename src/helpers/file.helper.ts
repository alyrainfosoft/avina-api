import fs from "fs";
import { TImageType } from "../data/types/common/common.type";
import { ALLOW_FILE_CONVERT_TO_WEBP_MIME_TYPE, IMAGE_TYPE_LOCATION, PRODUCT_ZIP_LOCATION } from "../utils/app-constants";
import { DEFAULT_STATUS_CODE_SUCCESS } from "../utils/app-messages";
import { generateRandomString, resSuccess, resUnknownError } from "../utils/shared-functions";
import { s3UploadObject} from "./s3-client.helper";
import { Multer } from "multer";
const { imageToWebp } = require("image-to-webp");
import sharp from "sharp";
import path from "path";
import { PRODUCT_CSV_FOLDER_PATH } from "../config/env.var";

export const moveFileByType = (
  fileName: string,
  sourcePath: string,
  type: TImageType
) => {
  let error;
  let destinationPath = IMAGE_TYPE_LOCATION[type] + "/" + fileName;
  createFolderIfNot(IMAGE_TYPE_LOCATION[type]);

  fs.rename(sourcePath + "/" + fileName, destinationPath, function (err) {
    if (err) {
      error = resUnknownError({ data: err });
    }
  });

  if (error) {
    return error;
  }

  return resSuccess({ data: destinationPath });
};

export const moveFileToS3ByType = async (
  db_connection: any,
  file: Express.Multer.File,
  type: TImageType,
  client_id: any,
  req?: any
) => {
  const companyKey = req?.body?.session_res?.client_key || req?.query?.company_key || req?.params?.company_key || req?.body?.company_key
  let destinationPath = companyKey && companyKey != null ? companyKey + "/" + IMAGE_TYPE_LOCATION[type] + "/" + createFileName(file.originalname) : IMAGE_TYPE_LOCATION[type] + "/" + createFileName(file.originalname);
  if (!(ALLOW_FILE_CONVERT_TO_WEBP_MIME_TYPE.includes(file.mimetype))) {
    // const fileStream = fs.readFileSync(file.path);
    const data = await s3UploadObject(
      db_connection,
      file.buffer,
      destinationPath,
      file.mimetype,
      client_id
    );
    if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return data;
    }
    return resSuccess({ data: destinationPath });
  } else {
    try {
      const lastDotIndex = destinationPath.lastIndexOf(".");
      const prefix = lastDotIndex >= 0 ? destinationPath.substring(0, lastDotIndex) : destinationPath;
      const webpImage = await sharp(file.buffer).webp({ quality: 50 }) // Adjust quality as needed
        .toBuffer();
      console.log("prefix", lastDotIndex);
      const data = await s3UploadObject(
        db_connection,
        webpImage,
        `${prefix}.webp`,
        "image/webp",
        client_id
      );
      if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return data;
      }
      return resSuccess({ data: `${prefix}.webp` });
    } catch (error) {
      console.log(error);
      return resUnknownError({ data: error });
    }
  }

  // const fileStream = fs.readFileSync(sourcePath + "/" + fileName);
  // await s3UploadObject(
  // db_connection,fileStream, destinationPath, file.mimetype);
  // fs.rmSync(sourcePath + "/" + fileName);
};

export const moveFileToS3ByTypeAndLocation = async (
  db_connection,
  file: Express.Multer.File | any,
  destinationFolder: string,
  client_id: any,
  req?: any
) => {
  const companyKey = req?.body?.session_res?.client_key || req?.query?.company_key || req?.params?.company_key || req?.body?.company_key

  const destinationPath = companyKey && companyKey != null && destinationFolder != PRODUCT_CSV_FOLDER_PATH && destinationFolder.includes('files/configurator/') == false ? companyKey + "/" + destinationFolder + "/" + file.originalname : destinationFolder + "/" + file.originalname;
  console.log("destinationPath", destinationPath)
  if (!(ALLOW_FILE_CONVERT_TO_WEBP_MIME_TYPE.includes(file.mimetype))) {
    // const fileStream = fs.readFileSync(file.path);
    const data = await s3UploadObject(
      db_connection,
      file.buffer,
      destinationPath,
      file.mimetype,
      client_id
    );
    if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return data;
    }
    return resSuccess({ data: destinationPath });
  } else {
    try {
      const lastDotIndex = destinationPath.lastIndexOf(".");
      const prefix = lastDotIndex >= 0 ? destinationPath.substring(0, lastDotIndex) : destinationPath;
      const webpImage = await sharp(file.buffer).webp({ quality: 50 }).toBuffer();
      const data = await s3UploadObject(
        db_connection,
        webpImage,
        `${prefix}.webp`,
        "image/webp",
        client_id
      );
      if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
        return data;
      }
      return resSuccess({ data: `${destinationPath.split(".")[0]}.webp` });
    } catch (error) {
      console.log(error);
      return resUnknownError({ data: error });
    }

  }

  // const fileStream = fs.readFileSync(sourcePath + "/" + fileName);
  // await s3UploadObject(
  // db_connection,fileStream, destinationPath, file.mimetype);
  // fs.rmSync(sourcePath + "/" + fileName);
};

export const moveOriginalFileToS3ByTypeAndLocation = async (
  db_connection,
  file: Express.Multer.File | any,
  destinationFolder: string,
  client_id: any,
  req?: any
) => {
  const companyKey = req?.body?.session_res?.client_key || req?.query?.company_key || req?.params?.company_key || req?.body?.company_key

  const destinationPath = companyKey && companyKey != null && destinationFolder != PRODUCT_CSV_FOLDER_PATH && destinationFolder.includes('files/configurator/') == false ? companyKey + "/" + destinationFolder + "/" + file.originalname : destinationFolder + "/" + file.originalname;
  
    try {
       const data = await s3UploadObject(
      db_connection,
      file.buffer,
      destinationPath,
      file.mimetype,
      client_id
    );
    if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
      return data;
    }
    return resSuccess({ data: destinationPath });
    } catch (error) {
      console.log(error);
      return resUnknownError({ data: error });
    }

};

export const createFolderIfNot = (path: string) => {
  let expectedFolderList = path.split("/");
  expectedFolderList.reduce((prevPath, currentPath) => {
    const path = prevPath + currentPath + "/";
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    return path;
  }, "/");
};

export const moveFileToLocation = (
  fileName: string,
  sourcePath: string,
  destinationFolder: string,
  originalname: string,
  req?: any
) => {
  let error;
  const companyKey = req?.body?.session_res?.client_key || req?.query?.company_key || req?.params?.company_key || req?.body?.company_key
  const destinationPath = companyKey && companyKey != null && destinationFolder != PRODUCT_CSV_FOLDER_PATH ? companyKey + "/" + destinationFolder + "/" + originalname : destinationFolder + "/" + originalname;
  createFolderIfNot(destinationFolder);

  fs.rename(sourcePath + "/" + fileName, destinationPath, function (err) {
    if (err) {
      error = resUnknownError({ data: err });
    }
  });

  if (error) {
    return error;
  }

  return resSuccess({ data: destinationPath });
};

const createFileName = (fileName: any) => {
  const imagePath = fileName
    .replace(/\s|\(|\)/g, "_")
    .replace(/\.[^/.]+$/, "");
  const ext = path.extname(fileName);

  return imagePath.toLocaleLowerCase() + "-" + generateRandomString(32) + ext
}