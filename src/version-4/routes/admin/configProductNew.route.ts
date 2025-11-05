import { Router } from "express";
import { reqProductBulkUploadFileParser } from "../../../middlewares/multipart-file-parser";
import {
  addAllConfigProductsFromNewCSVFileFn,
  addConfigProductsFromNewCSVFileFn,
  addRetailConfigProductsFromCSVFileFn,
  configProductDeleteApiFn,
  getAllConfigProductsFn,
} from "../../controllers/config-product-bulk-new.controller";
import {
  authorization,
} from "../../../middlewares/authenticate";
import {
  addConfigEternityProductFn,
  deleteConfigEternityProductFn,
  getConfigEternityProductsFn,
  getByIdConfigEternityProduct,
} from "../../controllers/config-enternity-product.controller";
import {
  addConfigBraceletProductFn,
  deleteBraceletConfiguratorProductFn,
  getBraceletConfiguratorProductDetailFn,
  getBraceletConfiguratorProductListFn,
} from "../../controllers/config-bracelet-comfig-bulk-upload.controller";
import { currencyMiddleware } from "../../../middlewares/currency-rate-change";

export default (app: Router) => {
  app.post(
    "/product/config/add/new",
    [authorization, reqProductBulkUploadFileParser("config_csv")],
    addConfigProductsFromNewCSVFileFn
  );

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
  );// baki

  /* ------------------ delete config eternity product --------------- */
  app.delete(
    "/eternity-band/:product_id",
    [authorization],
    deleteConfigEternityProductFn
  );
 
  /* ------------------ bracelet config product --------------- */

  app.post(
    "/bracelet-csv",
    [authorization, reqProductBulkUploadFileParser("config_csv")],
    addConfigBraceletProductFn
  );

  app.get("/bracelet", [authorization], getBraceletConfiguratorProductListFn);
  app.get(
    "/bracelet/:id",
    [authorization],
    getBraceletConfiguratorProductDetailFn
  );

  app.delete(
    "/bracelet/:id",
    [authorization],
    deleteBraceletConfiguratorProductFn
  );

};
