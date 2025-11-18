import { RequestHandler } from "express";
import { callServiceMethod } from "../base.controller";
import {   birthStonePtoductInShopify, birthStoneProductWithPriceInShopify, demoEncryptData, productListShopifyProduct, productListShopifyProductPublic } from "../../services/shopify/product.service";
import { getCADCOProductDetailsForClient } from "../../services/product-move-cadco-client.service";

export const productListShopifyProductFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, productListShopifyProduct(req), "productListShopifyProductFn");
}

export const productListShopifyProductPublicFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, productListShopifyProductPublic(req), "productListShopifyProductPublicFn");
}

/////////---- Birthstone product -----------/////////////////////////

export const birthStonePtoductInShopifyFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, birthStonePtoductInShopify(req), "birthStonePtoductInShopifyFn");
}

export const demoEncryptDataFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, demoEncryptData(req), "demoEncryptDataFn");
}

export const birthStoneProductWithPriceInShopifyFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, birthStoneProductWithPriceInShopify(req), "birthStonePtoductWithPriceInShopifyFn");
}

// export const addShopifyProductFn: RequestHandler = (req, res) => {
//     callServiceMethod(req, res, addShopifyProduct(req), "addShopifyProductFn");
// }

// export const addShopifyProductImagesFn: RequestHandler = (req, res) => {
//     callServiceMethod(req, res, publicShopifyProductStatus(req), "addShopifyProductImagesFn");
// }
