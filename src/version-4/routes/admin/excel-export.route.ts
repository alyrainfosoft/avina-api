import { Router } from "express";
import {
  braceletConfiguratorProductExportFn,
  dynamicProductExportFn,
  eternityBandConfiguratorProductExportFn,
  ringConfiguratorProductExportFn,
  threeStoneConfiguratorProductExportFn,
  variantProductExportFn,
} from "../../controllers/excel-export.controller";
import { authorization } from "../../../middlewares/authenticate";

export default (app: Router) => {
  app.get("/excel/dynamic-products",[authorization], dynamicProductExportFn);
  app.get("/excel/variant-products", [authorization], variantProductExportFn);
  app.get("/excel/ring-configurator-products", ringConfiguratorProductExportFn);
  app.get(
    "/excel/three-stone-configurator-products",
    threeStoneConfiguratorProductExportFn
  );
  app.get(
    "/excel/eternity-band-configurator-products",
    eternityBandConfiguratorProductExportFn
  );
  app.get(
    "/excel/bracelet-configurator-products",
    braceletConfiguratorProductExportFn
  );
};

