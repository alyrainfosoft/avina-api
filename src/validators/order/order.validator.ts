import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import { deliverySTatusUpdateRules, orderSTatusUpdateRules } from "./order.rules";

export const orderSTatusUpdateValidator: RequestHandler = async (
    req,
    res,
    next
  ) => {
    return await modelValidator(req, res, next, orderSTatusUpdateRules);
  };

  export const deliverySTatusUpdateValidator: RequestHandler = async (
    req,
    res,
    next
  ) => {
    return await modelValidator(req, res, next, deliverySTatusUpdateRules);
  };