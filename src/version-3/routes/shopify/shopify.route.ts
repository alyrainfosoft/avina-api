import { Router } from "express";
import {  birthStoneProductWithPriceInShopifyFn, birthStonePtoductInShopifyFn, demoEncryptDataFn, productListShopifyProductFn, productListShopifyProductPublicFn } from "../../controllers/shopify/product.controller";
import { reqSingleImageParser } from "../../../middlewares/multipart-file-parser";

export default (app: Router) => {

    app.post("/shopify/product/list", reqSingleImageParser('image'), productListShopifyProductFn);
    app.post("/public/shopify/product/list", reqSingleImageParser('image'), productListShopifyProductPublicFn);

    app.post("/shopify/birthstone/product/list", reqSingleImageParser('image'), birthStonePtoductInShopifyFn);
    app.post("/shopify/birthstone/product/price-add", reqSingleImageParser('image'), birthStoneProductWithPriceInShopifyFn);
    app.post("/demo/encrypt",  demoEncryptDataFn);

    // app.post("/shopify/product/add", addShopifyProductFn);
    // app.post("/shopify/product/image", addShopifyProductImagesFn);

}