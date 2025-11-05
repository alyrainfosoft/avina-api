import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import {
  addBusinessUserValidationRule,
  updateBusinessUserValidationRule,
} from "./user-management.rules";

export const addBusinessUserValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, addBusinessUserValidationRule);
};

export const updateBusinessUserValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, updateBusinessUserValidationRule);
};
