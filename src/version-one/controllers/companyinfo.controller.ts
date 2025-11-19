import { RequestHandler } from "express";
import {
  addCompanyInfo,
  getCompanyInfoData,
  getCompanyInfoCustomer,
  getCompanyInfoForAdmin,
  updateCompanyInfo,
  updateWebRestrictURL,
} from "../services/companyinfo.service";
import { callServiceMethod } from "./base.controller";

export const addCompanyInfoFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addCompanyInfo(req), "addCompanyInfoFn");
};

export const updateCompanyInfoFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateCompanyInfo(req), "updateCompanyInfoFn");
};

export const getAllCompanyInfoFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getCompanyInfoData(req), "getAllCompanyInfo");
};

export const getCompanyInfoCustomerFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getCompanyInfoCustomer(req),
    "getCompanyInfoCustomerFn"
  );
};
export const getCompanyInfoForAdminFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getCompanyInfoForAdmin(req),
    "getCompanyInfoForAdminFn"
  );
};
export const updateWebRestrictURLFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateWebRestrictURL(req),
    "updateWebRestrictURLFn"
  );
};
