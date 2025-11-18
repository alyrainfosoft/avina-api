import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import {
  reqArrayImageParser,
  reqSingleImageParser,
} from "../../../middlewares/multipart-file-parser";
import {
  addDiamondShapeSectionFn,
  addShopBySectionFn,
  addSplashScreenFn,
  deleteDiamondShapeSectionFn,
  deleteShopBySectionFn,
  deleteSplashScreenFn,
  getDiamondShapeSectionFn,
  getShopBySectionFn,
  getSplashScreenFn,
  statusUpdateForDiamondShapeSectionFn,
  statusUpdateForShopBySectionFn,
  statusUpdateForSplashScreenFn,
  templateThreeAllSectionDetailForUserFn,
  templateThreeAllSectionListForUserFn,
  updateDiamondShapeSectionFn,
  updateShopBySectionFn,
  updateSplashScreenFn,
} from "../../controllers/template-three.controller";
import { addProductDropdownFn } from "../../controllers/masters/master.controller";

export default (app: Router) => {
  /* Splash Screen */

  app.post(
    "/template-three/splash-screen",
    [authorization, reqSingleImageParser("image")],
    addSplashScreenFn
  );
  app.get("/template-three/splash-screen", [authorization], getSplashScreenFn);
  app.put(
    "/template-three/splash-screen/:id",
    [authorization, reqSingleImageParser("image")],
    updateSplashScreenFn
  );
  app.delete(
    "/template-three/splash-screen/:id",
    [authorization],
    deleteSplashScreenFn
  );
  app.patch(
    "/template-three/splash-screen/:id",
    [authorization],
    statusUpdateForSplashScreenFn
  );

  /* Diamond Shape Section */
  app.post(
    "/template-three/diamond-shape",
    [authorization, reqArrayImageParser(["image", "hover_image"])],
    addDiamondShapeSectionFn
  );
  app.get(
    "/template-three/diamond-shape",
    [authorization],
    getDiamondShapeSectionFn
  );
  app.put(
    "/template-three/diamond-shape/:id",
    [authorization, reqArrayImageParser(["image", "hover_image"])],
    updateDiamondShapeSectionFn
  );
  app.delete(
    "/template-three/diamond-shape/:id",
    [authorization],
    deleteDiamondShapeSectionFn
  );
  app.patch(
    "/template-three/diamond-shape/:id",
    [authorization],
    statusUpdateForDiamondShapeSectionFn
  );

  /* shop by Section */
  app.post(
    "/template-three/shop-by",
    [authorization, reqArrayImageParser(["image", "hover_image"])],
    addShopBySectionFn
  );
  app.get("/template-three/shop-by", [authorization], getShopBySectionFn);
  app.put(
    "/template-three/shop-by/:id",
    [authorization, reqArrayImageParser(["image", "hover_image"])],
    updateShopBySectionFn
  );
  app.delete(
    "/template-three/shop-by/:id",
    [authorization],
    deleteShopBySectionFn
  );
  app.patch(
    "/template-three/shop-by/:id",
    [authorization],
    statusUpdateForShopBySectionFn
  );
  app.get("/template-3/add-product/dropDown/list",[authorization], addProductDropdownFn);

};
