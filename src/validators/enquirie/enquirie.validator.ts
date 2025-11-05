import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import { activeInactiveSubscriptionRule, addEnquiriesValidationRule, addProductEnquiriesValidationRule, addSubscriptionsValidationRule } from "./enquirie.rules";

export const addEnquirieValidator: RequestHandler = async (req, res, next) => {
    return await modelValidator(req, res, next, addEnquiriesValidationRule);
  };

export const addProductEnquiriesValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addProductEnquiriesValidationRule);
};

export const addSubscriptionsValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addSubscriptionsValidationRule);
};

export const activeInactiveSubscriptionValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, activeInactiveSubscriptionRule);
};