import {
  DEFAULT_STATUS_CODE_ERROR,
  DEFAULT_STATUS_CODE_SUCCESS,
  DEFAULT_STATUS_ERROR,
  UNKNOWN_ERROR_TRY_AGAIN,
} from "../../utils/app-messages";
import {
  decryptRequestData,
  encryptResponseData,
  getLocalDate,
  parseData,
} from "../../utils/shared-functions";
import { Request, Response } from "express";
import { saveServerLogs } from "../../helpers/log.hepler";
import { SECURE_COMMUNICATION } from "../../config/env.var";
import { PUBLIC_API_URL } from "../../utils/app-constants";
const crypto = require("crypto");

export async function callServiceMethod(
  req: Request,
  res: Response,
  serviceMethodTocall: any,
  actionName: string
) {
  if (req?.params?.company_key) {
    req.params.company_key = JSON.parse(decryptRequestData(req?.params?.company_key));
  }
  const requestTime = getLocalDate();
  let response;
  try {
    const data = await serviceMethodTocall;
    response = {
      status: data?.code ? data.code : DEFAULT_STATUS_CODE_SUCCESS,
      data: data ? data : null,
    };
  } catch (err: any) {
    response = {
      status: err.code ? err.code : DEFAULT_STATUS_CODE_ERROR,
      data: {
        code: err.code ? err.code : DEFAULT_STATUS_CODE_ERROR,
        message: err.message ? err.message : UNKNOWN_ERROR_TRY_AGAIN,
        status: err.status ? err.status : DEFAULT_STATUS_ERROR,
        data: err.data && typeof err != "object" ? parseData(err) : null,
      },
    };
  }

  saveServerLogs({
    requestTime,
    url: req.originalUrl,
    action: actionName,
    body: req.body,
    responseTime: getLocalDate(),
    response: response.data,
  });

  const encodedResponse =
    SECURE_COMMUNICATION.toString() == "true" &&
    !PUBLIC_API_URL.includes(req.originalUrl)
      ? encryptResponseData(response.data)
      : response.data;

  return res.status(response.status).send(encodedResponse);
}
