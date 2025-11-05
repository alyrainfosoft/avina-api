import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import {
  addShippingChargeValidatorRule,
  applyShippingChargeValidatorRule,
  updateShippingChargeValidatorRule,
} from "./shipping-charge.rules";

export const addShippingChargeValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, addShippingChargeValidatorRule);
};

export const updateShippingChargeValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(
    req,
    res,
    next,
    updateShippingChargeValidatorRule
  );
};

export const applyShippingChargeValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, applyShippingChargeValidatorRule);
};
