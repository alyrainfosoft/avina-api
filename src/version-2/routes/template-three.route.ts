import { Router } from "express";
import { authorization } from "../../middlewares/authenticate";
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
} from "../controllers/template-three.controller";
import {
  reqArrayImageParser,
  reqSingleImageParser,
} from "../../middlewares/multipart-file-parser";

export default (app: Router) => {
  app.post(
    "/template-three/banner",
    [authorization, reqSingleImageParser("image")],
    addBannerFn
  );
  app.get("/template-three/banner", [authorization], getBannerFn);
  app.put(
    "/template-three/banner/:id",
    [authorization, reqSingleImageParser("image")],
    updateBannerFn
  );
  app.delete("/template-three/banner/:id", [authorization], deleteBannerFn);
  app.patch(
    "/template-three/banner/:id",
    [authorization],
    statusUpdateForBannerFn
  );

  app.post(
    "/template-three/jewelry-section",
    [authorization, reqArrayImageParser(["image", "title_image", "sub_image"])],
    addJewelrySectionFn
  );
  app.get(
    "/template-three/jewelry-section",
    [authorization],
    getJewelrySectionFn
  );
  app.put(
    "/template-three/jewelry-section/:id",
    [authorization, reqArrayImageParser(["image", "title_image", "sub_image"])],
    updateJewelrySectionFn
  );
  app.delete(
    "/template-three/jewelry-section/:id",
    [authorization],
    deleteJewelrySectionFn
  );
  app.patch(
    "/template-three/jewelry-section/:id",
    [authorization],
    statusUpdateForJewelrySectionFn
  );

  app.post(
    "/template-three/diamond-section",
    [authorization, reqArrayImageParser(["image", "sub_image"])],
    addDiamondSectionFn
  );
  app.get(
    "/template-three/diamond-section",
    [authorization],
    getDiamondSectionFn
  );
  app.put(
    "/template-three/diamond-section/:id",
    [authorization, reqArrayImageParser(["image", "sub_image"])],
    updateDiamondSectionFn
  );
  app.delete(
    "/template-three/diamond-section/:id",
    [authorization],
    deleteDiamondSectionFn
  );
  app.patch(
    "/template-three/diamond-section/:id",
    [authorization],
    statusUpdateForDiamondSectionFn
  );

  app.post(
    "/template-three/category-section",
    [authorization, reqSingleImageParser("image")],
    addCategorySectionFn
  );
  app.get(
    "/template-three/category-section",
    [authorization],
    getCategorySectionFn
  );
  app.put(
    "/template-three/category-section/:id",
    [authorization, reqSingleImageParser("image")],
    updateCategorySectionFn
  );
  app.delete(
    "/template-three/category-section/:id",
    [authorization],
    deleteCategorySectionFn
  );
  app.patch(
    "/template-three/category-section/:id",
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
