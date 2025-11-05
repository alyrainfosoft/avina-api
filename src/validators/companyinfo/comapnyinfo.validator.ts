import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import { companyInfoValidationRule } from "./comapnyinfo.rules";

export const companyInfoValidator: RequestHandler = async (req, res, next) => {
    return await modelValidator(req, res, next, companyInfoValidationRule);
  };