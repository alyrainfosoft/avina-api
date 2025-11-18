import { RequestHandler } from "express";
import { callServiceMethod } from "../base.controller";
import { pendantProductAddToCartShopify } from "../../services/shopify/pendant.service";

export const pendantProductAddToCartShopifyFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, pendantProductAddToCartShopify(req), "pendantProductAddToCartShopifyFn");
}