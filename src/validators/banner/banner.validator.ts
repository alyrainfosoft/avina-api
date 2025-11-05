import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import {
  addBannerValidationRule,
  addMarketingBannerValidationRule,
  addOurStoryValidationRule,
  updateBannerValidationRule,
  updateMarketingBannerValidationRule,
} from "./banner.rules";

export const addBannerValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addBannerValidationRule);
};

export const updateBannerValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, updateBannerValidationRule);
};

export const addMarketingBannerValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addMarketingBannerValidationRule);
};

export const updateMarketingBannerValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, updateMarketingBannerValidationRule);
};

export const addOurStoryValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addOurStoryValidationRule);
};