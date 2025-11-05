import { RequestHandler } from "express";
import modelValidator from "../../model.validator";
import { addProductAndCategoryRules } from "./product-and-category.rules";

export const addPoductAndCategoryValidator: RequestHandler = async (
    req,
    res,
    next
  ) => {
    return await modelValidator(req, res, next, addProductAndCategoryRules);
  };

