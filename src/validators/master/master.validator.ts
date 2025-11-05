import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import {
  addMasterNameSlugValidationRule,
  addMasterCurrencyValidationRule,
  addMasterValidationRule,
  statusUpdateMasterValidationRule,
  updateMasterNameSlugValidationRule,
  updateMasterValidationRule,
  addMasterValueValidationRule,
  updateMasterValueValidationRule,
  addTagRule,
  updateTagRule,
  deleteMasterIdRule,
  statusTagRule,
  addMasterValueSortCodeRule,
  updateMasterValueSortCodeRule,
  masterValidatorRule,
  updateMasterCurrencyValidationRule,
  addMasterCurrencyRateValidationRule,
  diamondGroupMasterValidatorRule,
} from "./master.rules";

export const addMasterValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addMasterValidationRule);
};

export const updateMasterValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, updateMasterValidationRule);
};

export const statusUpdateMasterValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, statusUpdateMasterValidationRule);
};

export const addMasterCurrencyValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, addMasterCurrencyValidationRule);
};
export const addMasterCurrencyRateValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(
    req,
    res,
    next,
    addMasterCurrencyRateValidationRule
  );
};
export const updateMasterCurrencyValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(
    req,
    res,
    next,
    updateMasterCurrencyValidationRule
  );
};

export const addMasterNameSlugValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, addMasterNameSlugValidationRule);
};

export const updateMasterNameSlugValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(
    req,
    res,
    next,
    updateMasterNameSlugValidationRule
  );
};

export const addMasterValueSlugValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, addMasterValueValidationRule);
};

export const updateMasterValueSlugValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, updateMasterValueValidationRule);
};

export const addTagValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addTagRule);
};

export const updateTagValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, updateTagRule);
};

export const deleteMasterIdValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, deleteMasterIdRule);
};

export const statusTagValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, statusTagRule);
};

export const addMasterValueSortCodeRuleValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, addMasterValueSortCodeRule);
};

export const updateMasterValueSortCodeRuleValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, updateMasterValueSortCodeRule);
};

export const masterValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, masterValidatorRule);
};

export const diamondGroupMasterValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, diamondGroupMasterValidatorRule);
};