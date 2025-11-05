import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import { slugPendantPriceRules, pendantPriceRules } from "./pendant.rules";

export const pendantValidator: RequestHandler = async (req, res, next) => {
    return await modelValidator(req, res, next, pendantPriceRules);
};

export const slugPendantValidator: RequestHandler = async (req, res, next) => {
    return await modelValidator(req, res, next, slugPendantPriceRules);
};