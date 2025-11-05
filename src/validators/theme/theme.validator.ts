import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import { addClientValidationRule, addFiltersValidationRule, addThemeValidationRule, deleteFontFileValidationRule, generalCompanyInfoValidationRule, systemColorValidationRule, systemFontStyleValidationRule, updateClientValidationRule, updateFiltersValidationRule, updateThemeValidationRule } from "./theme.rules";

export const addThemeValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addThemeValidationRule);
};

export const updateThemeValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, updateThemeValidationRule);
}

export const generalCompanyInfoValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, generalCompanyInfoValidationRule);
}

export const systemFontStyleValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, systemFontStyleValidationRule);
}

export const systemColorValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, systemColorValidationRule);
}

export const deleteFontFileValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, deleteFontFileValidationRule);
}

export const addClientValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addClientValidationRule);
}

export const updateClientValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, updateClientValidationRule);
}

export const addFiltersValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addFiltersValidationRule);
}

export const updateFiltersValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, updateFiltersValidationRule);
}