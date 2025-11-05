import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { getCompanyInfoForAdminByClient, updateGeneralCompanyInfoByClient } from "../services/client-company-info.service";

export const updateGeneralCompanyInfoByClientFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateGeneralCompanyInfoByClient(req), "updateGeneralCompanyInfoByClientFn");
  };

export const getCompanyInfoForAdminByClientFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getCompanyInfoForAdminByClient(req), "getCompanyInfoForAdminByClientFn");
}
