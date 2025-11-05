import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import { priceCorrectionRules } from "./price-correction.rules";

export const priceCorrectionValidator: RequestHandler = async (req, res, next) => {
    return await modelValidator(req, res, next, priceCorrectionRules);
};
