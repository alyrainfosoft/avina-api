import { Router } from "express";
import { reqProductBulkUploadFileParser } from "../../middlewares/multipart-file-parser";
import {
  addAllConfigProductsFromNewCSVFileFn,
  addConfigProductsFromNewCSVFileFn,
  addRetailConfigProductsFromCSVFileFn,
  configProductDeleteApiFn,
  configProductMazzsRetailPriceFindFn,
  configProductRetailPriceFindFn,
  newConfigProductPriceFindFn,
  publicConfigProductRetailPriceFindFn,
  threeStoneProductRetailPriceFindFn,
  getAllConfigProductsFn,
} from "../controllers/config-product-bulk-new.controller";
import {
  authorization,
  customerAuthorization,
} from "../../middlewares/authenticate";
import {
  addConfigEternityProductFn,
  deleteConfigEternityProductFn,
  eternityPriceFindFn,
  getConfigEternityProductsFn,
  getByIdConfigEternityProduct,
  getEternityProductDetailForUserFn,
} from "../controllers/config-enternity-product.controller";

export default (app: Router) => {
  app.post(
    "/product/config/add/new",
    [authorization, reqProductBulkUploadFileParser("config_csv")],
    addConfigProductsFromNewCSVFileFn
  );

  app.post("/product/price/find/new", newConfigProductPriceFindFn);
  app.get(
    "/product/configurator-list",
    [authorization],
    getAllConfigProductsFn
  );

  /* All config product add */

  app.post(
    "/all/config/product/add",
    [authorization, reqProductBulkUploadFileParser("config_csv")],
    addAllConfigProductsFromNewCSVFileFn
  );
  /*----------------- retail & discount Config product add -------------*/

  app.post(
    "/product/config/add/reatil-discount",
    [authorization, reqProductBulkUploadFileParser("config_csv")],
    addRetailConfigProductsFromCSVFileFn
  );

  app.post(
    "/product/price/find/retail-discount",
    configProductRetailPriceFindFn
  );

  app.post(
    "/public/product/price/find/retail-discount",
    publicConfigProductRetailPriceFindFn
  );
  /*----------------- three stone config find price  --------------------*/
  app.post(
    "/product-three-stone/price/find/retail-discount",
    threeStoneProductRetailPriceFindFn
  );
  /*----------------- config product find price Mazz --------------------*/

  app.post(
    "/product/price/find/mazz/retail-discount",
    configProductMazzsRetailPriceFindFn
  );

  /* ------------------ config product delete --------------- */
  app.put("/product/config/delete", [authorization], configProductDeleteApiFn);

  /* ------------------ add config eternity product --------------- */
  app.post(
    "/eternity-band-csv",
    [authorization, reqProductBulkUploadFileParser("config_csv")],
    addConfigEternityProductFn
  );

  /* ------------------ get config eternity products --------------- */
  app.get("/eternity-band", [authorization], getConfigEternityProductsFn);
  /* ------------------ get config eternity product by id --------------- */
  app.get(
    "/eternity-band/:product_id",
    [authorization],
    getByIdConfigEternityProduct
  );
  app.get("/user/eternity-band/:slug", getEternityProductDetailForUserFn);

  /* ------------------ delete config eternity product --------------- */
  app.delete(
    "/eternity-band/:product_id",
    [authorization],
    deleteConfigEternityProductFn
  );
  /* ------------------ get config eternity product price --------------- */
  app.post("/eternity-band-price", eternityPriceFindFn);
};
