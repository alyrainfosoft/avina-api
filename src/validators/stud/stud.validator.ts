import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import { slugStudPriceRules, studPriceRules } from "./stud.rules";

export const studValidator: RequestHandler = async (req, res, next) => {
    return await modelValidator(req, res, next, studPriceRules);
};

export const slugStudValidator: RequestHandler = async (req, res, next) => {
    return await modelValidator(req, res, next, slugStudPriceRules);
};