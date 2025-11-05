import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import { addMegaMenuAttributeValidationRule, addMegaMenuValidationRule } from "./mega-menu.rules";

export const addMegaMenuValidator: RequestHandler = async (req, res, next) => {
  return await modelValidator(req, res, next, addMegaMenuValidationRule);
};

export const addMegaMenuAttributeValidator: RequestHandler = async (req, res, next) => {
    return await modelValidator(req, res, next, addMegaMenuAttributeValidationRule);
  };