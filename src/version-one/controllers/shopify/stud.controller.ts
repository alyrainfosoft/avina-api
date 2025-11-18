import { RequestHandler } from "express";
import { callServiceMethod } from "../base.controller";
import { studProductAddToCartShopify } from "../../services/shopify/stud.service";

export const studProductAddToCartShopifyFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, studProductAddToCartShopify(req), "studProductAddToCartShopifyFn");
}