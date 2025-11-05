import { RequestHandler } from "express";
import modelValidator from "../../model.validator";
import { addblogRules, updateblogRules } from "./blog.rules";

export const addBlogValidator: RequestHandler = async (
    req,
    res,
    next
  ) => {
    return await modelValidator(req, res, next, addblogRules);
  };

  export const updateBlogValidator: RequestHandler = async (
    req,
    res,
    next
  ) => {
    return await modelValidator(req, res, next, updateblogRules);
  };