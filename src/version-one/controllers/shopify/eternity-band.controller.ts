import { RequestHandler } from "express";
import { callServiceMethod } from "../base.controller";
import { eternityBandConfiguratorProduct } from "../../services/shopify/eternity-band.service";


export const eternityBandConfiguratorProductFn: RequestHandler = async (req, res) => {
  await callServiceMethod(
    req,
    res,
    eternityBandConfiguratorProduct(req),
    'eternityBandConfiguratorProductFn'
  );
};