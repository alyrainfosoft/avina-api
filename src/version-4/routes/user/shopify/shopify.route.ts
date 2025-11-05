import { Router } from "express";
import { birthStoneProductWithPriceInShopifyFn, birthStonePtoductInShopifyFn, demoEncryptDataFn, productListShopifyProductFn, productListShopifyProductPublicFn } from "../../../controllers/shopify/product.controller";
import { reqSingleImageParser } from "../../../../middlewares/multipart-file-parser";
import { studProductAddToCartShopifyFn } from "../../../controllers/shopify/stud.controller";
import { pendantProductAddToCartShopifyFn } from "../../../controllers/shopify/pendant.controller";
import { eternityBandConfiguratorProductFn } from "../../../controllers/shopify/eternity-band.controller";

export default (app: Router) => {

    app.post("/shopify/product/list", reqSingleImageParser('image'), productListShopifyProductFn);
    app.post(
        '/shopify/eternity-band-product',
        reqSingleImageParser('image'),
        eternityBandConfiguratorProductFn
    );
    // app.post("/public/shopify/product/list", reqSingleImageParser('image'), productListShopifyProductPublicFn);

    app.post("/shopify/birthstone/product/list", reqSingleImageParser('image'), birthStonePtoductInShopifyFn);
    app.post("/shopify/birthstone/product/price-add", reqSingleImageParser('image'), birthStoneProductWithPriceInShopifyFn);
    app.post("/shopify/stud", reqSingleImageParser('image'), studProductAddToCartShopifyFn);
    app.post("/shopify/pendant", reqSingleImageParser('image'), pendantProductAddToCartShopifyFn);
    // app.post("/demo/encrypt",  demoEncryptDataFn);

    // app.post("/shopify/product/add", addShopifyProductFn);
    // app.post("/shopify/product/image", addShopifyProductImagesFn);

}