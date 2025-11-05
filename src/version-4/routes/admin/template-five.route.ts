import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import {
  addBannerFn,
  addCategorySectionFn,
  addDiamondSectionFn,
  addJewelrySectionFn,
  addProductModelFn,
  deleteBannerFn,
  deleteCategorySectionFn,
  deleteDiamondSectionFn,
  deleteJewelrySectionFn,
  deleteProductModelFn,
  getBannerFn,
  getCategorySectionFn,
  getDiamondSectionFn,
  getJewelrySectionFn,
  getProductModelFn,
  statusUpdateForBannerFn,
  statusUpdateForCategorySectionFn,
  statusUpdateForDiamondSectionFn,
  statusUpdateForJewelrySectionFn,
  statusUpdateForProductModelFn,
  updateBannerFn,
  updateCategorySectionFn,
  updateDiamondSectionFn,
  updateJewelrySectionFn,
  updateProductModelFn,
} from "../../controllers/template-five.controller";
import {
  reqArrayImageParser,
  reqSingleImageParser,
} from "../../../middlewares/multipart-file-parser";

export default (app: Router) => {
  app.post(
    "/template-five/banner",
    [authorization, reqSingleImageParser("image")],
    addBannerFn
  );
  app.get("/template-five/banner", [authorization], getBannerFn);
  app.put(
    "/template-five/banner/:id",
    [authorization, reqSingleImageParser("image")],
    updateBannerFn
  );
  app.delete("/template-five/banner/:id", [authorization], deleteBannerFn);
  app.patch(
    "/template-five/banner/:id",
    [authorization],
    statusUpdateForBannerFn
  );

  app.post(
    "/template-five/jewelry-section",
    [authorization, reqArrayImageParser(["image", "title_image", "sub_image"])],
    addJewelrySectionFn
  );
  app.get(
    "/template-five/jewelry-section",
    [authorization],
    getJewelrySectionFn
  );
  app.put(
    "/template-five/jewelry-section/:id",
    [authorization, reqArrayImageParser(["image", "title_image", "sub_image"])],
    updateJewelrySectionFn
  );
  app.delete(
    "/template-five/jewelry-section/:id",
    [authorization],
    deleteJewelrySectionFn
  );
  app.patch(
    "/template-five/jewelry-section/:id",
    [authorization],
    statusUpdateForJewelrySectionFn
  );

  app.post(
    "/template-five/diamond-section",
    [authorization, reqArrayImageParser(["image", "sub_image"])],
    addDiamondSectionFn
  );
  app.get(
    "/template-five/diamond-section",
    [authorization],
    getDiamondSectionFn
  );
  app.put(
    "/template-five/diamond-section/:id",
    [authorization, reqArrayImageParser(["image", "sub_image"])],
    updateDiamondSectionFn
  );
  app.delete(
    "/template-five/diamond-section/:id",
    [authorization],
    deleteDiamondSectionFn
  );
  app.patch(
    "/template-five/diamond-section/:id",
    [authorization],
    statusUpdateForDiamondSectionFn
  );

  app.post(
    "/template-five/category-section",
    [authorization, reqSingleImageParser("image")],
    addCategorySectionFn
  );
  app.get(
    "/template-five/category-section",
    [authorization],
    getCategorySectionFn
  );
  app.put(
    "/template-five/category-section/:id",
    [authorization, reqSingleImageParser("image")],
    updateCategorySectionFn
  );
  app.delete(
    "/template-five/category-section/:id",
    [authorization],
    deleteCategorySectionFn
  );
  app.patch(
    "/template-five/category-section/:id",
    [authorization],
    statusUpdateForCategorySectionFn
  );

  /* product model */

  app.post(
    "/product-model",
    [authorization, reqSingleImageParser("image")],
    addProductModelFn
  );
  app.get("/product-model", [authorization], getProductModelFn);
  app.put(
    "/product-model/:id",
    [authorization, reqSingleImageParser("image")],
    updateProductModelFn
  );
  app.delete("/product-model/:id", [authorization], deleteProductModelFn);
  app.patch(
    "/product-model/:id",
    [authorization],
    statusUpdateForProductModelFn
  );
};
