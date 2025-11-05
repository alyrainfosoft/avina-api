import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import { addressValidationRule, addStoreAddressValidationRule } from "./address.rules";

export const addressValidator: RequestHandler = async (req, res, next) => {
    return await modelValidator(req, res, next, addressValidationRule);
}
  
export const addStoreAddressValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addStoreAddressValidationRule);
}