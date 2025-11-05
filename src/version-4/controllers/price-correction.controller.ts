import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addOrUpdatePriceCorrection, getPriceCorrection } from "../services/price-correction.service";

export const getPriceCorrectionFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getPriceCorrection(req), "getPriceCorrectionFn");
}

export const addOrUpdatePriceCorrectionFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addOrUpdatePriceCorrection(req), "addOrUpdatePriceCorrectionFn");
}