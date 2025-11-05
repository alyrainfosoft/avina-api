import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  ListObjectsCommand,
} from "@aws-sdk/client-s3";
import {
  getLocalDate,
  getWebSettingData,
  resSuccess,
  resUnknownError,
} from "../utils/shared-functions";
import {
  DEFAULT_STATUS_CODE_ERROR,
  DEFAULT_STATUS_CODE_SUCCESS,
} from "../utils/app-messages";
import { saveS3LogsToFile } from "./log.hepler";
import path from "path";



enum S3ServiceMethods {
  PutObjectCommand = 1,
  GetObjectCommand = 2,
  DeleteObjectCommand = 3,
}

const getS3ServiceMethod = new Map<number, any>([
  [S3ServiceMethods.PutObjectCommand, PutObjectCommand],
  [S3ServiceMethods.GetObjectCommand, GetObjectCommand],
  [S3ServiceMethods.DeleteObjectCommand, DeleteObjectCommand],
]);

const getS3ServiceMethodLabel = new Map<number, any>([
  [S3ServiceMethods.PutObjectCommand, "PutObjectCommand"],
  [S3ServiceMethods.GetObjectCommand, "GetObjectCommand"],
  [S3ServiceMethods.DeleteObjectCommand, "DeleteObjectCommand"],
]);

export const s3UploadObject = async (
  db_connection: any,
  file: any,
  path: string,
  mimetype: string,
  client_id: any,
) => {
  const configData = client_id && client_id !== null ? await getWebSettingData(db_connection,client_id) : null;
  const payload = {
    Bucket: configData?.s3_bucket_name || process.env.S3_BUCKET_NAME,
    Key: path,
    Body: file,
    ContentType: mimetype,
  };
  const result = await S3RequestPromise(
    db_connection,
    S3ServiceMethods.PutObjectCommand,
    payload,
    client_id
  );
  return result;
};

export const s3RemoveObject = async (db_connection: any, key: string, client_id: any) => {
  const configData = client_id && client_id !== null ? await getWebSettingData(db_connection,client_id) : null;
  const payload = {
    Bucket: configData?.s3_bucket_name || process.env.S3_BUCKET_NAME,
    Key: key,

  };
  const result = await S3RequestPromise(
    db_connection,
    S3ServiceMethods.DeleteObjectCommand,
    payload
  );
  return result;
};

export const s3GetImageObject = async (db_connection: any,key: string, client_id: any) => {
  const configData = client_id && client_id !== null ? await getWebSettingData(db_connection,client_id) : null;

  const payload = { Bucket: process.env.S3_BUCKET_NAME || configData?.s3_bucket_name, Key: key };
  const result: any = await S3RequestPromise(
    db_connection,
    S3ServiceMethods.GetObjectCommand,
    payload
  );
  if (result.code !== DEFAULT_STATUS_CODE_SUCCESS) {
    return result;
  }
  const img = await Buffer.from(await streamToString(result.Body), "base64");
  return img;

  // response with length and content type
  return { img, length: img.length, type: result.ContentType };
};

export const s3ListObjects = async (db_connection: any,key: string, client_id: any) => {
  const configData = client_id && client_id !== null ? await getWebSettingData(db_connection,client_id) : null;

  const S3 = new S3Client({
    region: process.env.S3_REGION || configData?.s3_bucket_region,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || configData?.s3_bucket_access_key,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || configData?.s3_bucket_secret_access_key,
    },
  });
  const payload = { Bucket: process.env.S3_BUCKET_NAME || configData?.s3_bucket_name, Prefix: key, Delimiter: "/" };
  const result = await S3.send(new ListObjectsV2Command(payload));
  if (!result.Contents || result.Contents.length === 0) {
    return [];
  } else {
    const imageNames = result.Contents.map((file: any) =>
      file.Key.replaceAll(" # ", "+%23+")
    );
    return imageNames;
  }
};

const streamToString = async (stream: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: any = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
  });

const S3RequestPromise = async (db_connection: any,S3ServiceMethod: number, payload: any, client_id?: any) => {
  const configData = client_id && client_id !== null ? await getWebSettingData(db_connection,client_id) : null;
  const S3 = new S3Client({
    region: configData?.s3_bucket_region || process.env.S3_REGION,
    credentials: {
      accessKeyId: configData?.s3_bucket_access_key || process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: configData?.s3_bucket_secret_access_key || process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  const requestTime = getLocalDate();
  let result = null;
  try {
    const method = getS3ServiceMethod.get(S3ServiceMethod);
    const s3Response: any = await S3.send(new method(payload));
    result = resSuccess({ data: s3Response });
  } catch (e) {
    result = resUnknownError({ data: e });
  }
  const responseTime = getLocalDate();
  saveS3LogsToFile(
    requestTime,
    getS3ServiceMethodLabel.get(S3ServiceMethod),
    S3ServiceMethod === S3ServiceMethods.PutObjectCommand
      ? { ...payload, Body: "" }
      : payload,
    responseTime,
    result.code === DEFAULT_STATUS_CODE_ERROR ? result.data : "success"
  );

  return result;
};
