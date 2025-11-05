import { RequestHandler } from "express";
import modelValidator from "../../model.validator";
import { addJewellrycategoriesRules, updateJewellrycategoriesRules, } from "./jewellry-categories.rules";

export const addJewellryCategoriesValidator: RequestHandler = async (
    req,
    res,
    next
  ) => {
    return await modelValidator(req, res, next, addJewellrycategoriesRules);
  };

  export const updateJewellryCategoriesValidator: RequestHandler = async (
    req,
    res,
    next
  ) => {
    return await modelValidator(req, res, next, updateJewellrycategoriesRules);
  };