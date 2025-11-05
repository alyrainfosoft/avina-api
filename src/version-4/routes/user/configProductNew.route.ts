import { Router } from "express";
import {
  configProductMazzsRetailPriceFindFn,
  ringConfiguratorPriceFindWithUsingMaterializedViewFn,
  newConfigProductPriceFindFn,
  publicConfigProductRetailPriceFindFn,
  threeStonePriceFindWithUsingMaterializedViewFn,
  ringConfiguratorPriceFindWithoutUsingMaterializedViewFn,
  threeStonePriceFindWithoutUsingMaterializedViewFn,
} from "../../controllers/config-product-bulk-new.controller";

import {
  eternityPriceFindFn,
  eternityProductPriceFindWithoutUsingMaterializedViewFn,
  getEternityProductDetailForUserFn,
} from "../../controllers/config-enternity-product.controller";
import {
  braceletConfiguratorProductPriceFindWithUsingMaterializedViewFn,
  braceletConfiguratorProductPriceFindWithoutUsingMaterializedViewFn,
  getBraceletConfiguratorProductDetailForUserFn,
} from "../../controllers/config-bracelet-comfig-bulk-upload.controller";
import { currencyMiddleware } from "../../../middlewares/currency-rate-change";

export default (app: Router) => {
 
  // app.post("/product/price/find/new", newConfigProductPriceFindFn);
  
  /*----------------- retail & discount Config product add -------------*/

  app.post(
    "/product/price/find/retail-discount",
    [currencyMiddleware],
    ringConfiguratorPriceFindWithoutUsingMaterializedViewFn
  );

  app.post(
    "/view/product/price/find/retail-discount",
    [currencyMiddleware],
    ringConfiguratorPriceFindWithUsingMaterializedViewFn
  );

  // app.post(
  //   "/public/product/price/find/retail-discount",
  //   publicConfigProductRetailPriceFindFn
  // );
  /*----------------- three stone config find price  --------------------*/
  app.post(
    "/product-three-stone/price/find/retail-discount",
    [currencyMiddleware],
    threeStonePriceFindWithoutUsingMaterializedViewFn
  );
  app.post(
    "/view/product-three-stone/price/find/retail-discount",
    [currencyMiddleware],
    threeStonePriceFindWithUsingMaterializedViewFn
  );

  /*----------------- config product find price Mazz --------------------*/

  app.post(
    "/product/price/find/mazz/retail-discount",
    configProductMazzsRetailPriceFindFn
  );

  app.get("/eternity-band/:slug", getEternityProductDetailForUserFn);


  /* ------------------ get config eternity product price --------------- */
  app.post("/eternity-band-price", [currencyMiddleware], eternityProductPriceFindWithoutUsingMaterializedViewFn);
  app.post("/view/eternity-band-price", [currencyMiddleware], eternityPriceFindFn);
  /* ------------------ bracelet config product --------------- */
  
  app.get(
    "/bracelet/:slug",
    getBraceletConfiguratorProductDetailForUserFn
  );

  app.post(
    "/bracelet-price",
    [currencyMiddleware],
    braceletConfiguratorProductPriceFindWithoutUsingMaterializedViewFn
  );

  app.post(
    "/view/bracelet-price",
    [currencyMiddleware],
    braceletConfiguratorProductPriceFindWithUsingMaterializedViewFn
  );
};
