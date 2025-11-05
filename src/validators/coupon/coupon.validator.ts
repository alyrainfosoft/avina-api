import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import {
  addCouponValidationRule,
  updateCouponValidationRule,
} from "./coupon.rules";

export const addCouponValidation: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addCouponValidationRule);
};

export const updateCouponValidation: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, updateCouponValidationRule);
};
