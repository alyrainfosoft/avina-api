import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import { infoSectionRules } from "./info-section.rules";

export const infoSectionValidator: RequestHandler = async (req, res, next) => {
    return await modelValidator(req, res, next, infoSectionRules);
}