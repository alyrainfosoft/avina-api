import { Router } from "express";
import {
  braceletConfiguratorProductExportFn,
  dynamicProductExportFn,
  eternityBandConfiguratorProductExportFn,
  ringConfiguratorProductExportFn,
  threeStoneConfiguratorProductExportFn,
  variantProductExportFn,
} from "../../controllers/excel-export.controller";

export default (app: Router) => {
  // app.get("/excel/ring-configurator-products", ringConfiguratorProductExportFn);
  // app.get(
  //   "/excel/three-stone-configurator-products",
  //   threeStoneConfiguratorProductExportFn
  // );
  // app.get(
  //   "/excel/eternity-band-configurator-products",
  //   eternityBandConfiguratorProductExportFn
  // );
  // app.get(
  //   "/excel/bracelet-configurator-products",
  //   braceletConfiguratorProductExportFn
  // );
};
