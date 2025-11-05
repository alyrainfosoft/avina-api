import { Router } from "express";
import {
  addBannerFn,
  addFeatureSectionFn,
  addMarketingBannerFn,
  addMarketingPopupFn,
  deleteBannerFn,
  deleteFeatureSectionFn,
  deleteMarketingBannerFn,
  deleteMarketingPopupFn,
  getAllBannersFn,
  getAllFeatureSectionFn,
  getAllMarketingBannersFn,
  getAllMarketingPopupFn,
  statusUpdateBannerFn,
  statusUpdateFeatureSectionFn,
  statusUpdateMarketingBannerFn,
  statusUpdateMarketingPopupFn,
  updateBannerFn,
  updateFeatureSectionFn,
  updateMarketingBannerFn,
  updateMarketingPopupFn,
} from "../controllers/banner.controller";
import { getAllMainCategoryFn } from "../controllers/category.controller";
import { reqSingleImageParser } from "../middlewares/multipart-file-parser";
import {
  addBannerValidator,
  addMarketingBannerValidator,
  updateBannerValidator,
  updateMarketingBannerValidator,
} from "../validators/banner/banner.validator";
import { authorization } from "../middlewares/authenticate";

export default (app: Router) => {
  app.post(
    "/banners",
    [authorization, reqSingleImageParser("image"), addBannerValidator],
    addBannerFn
  );

  app.put(
    "/banners/edit",
    [authorization, reqSingleImageParser("image"), updateBannerValidator],
    updateBannerFn
  );

  app.post("/banners/delete", [authorization], deleteBannerFn);

  app.get("/banners", [authorization], getAllBannersFn);

  app.put("/banners/status", [authorization], statusUpdateBannerFn);
  //////////////------ marketing banner ----////////////////

  app.post("/marketingBanner/add", [authorization, reqSingleImageParser("image"), addMarketingBannerValidator], addMarketingBannerFn )
  app.get("/marketingBanner", [authorization], getAllMarketingBannersFn);
  app.put("/marketingBanner/edit",[authorization, reqSingleImageParser("image"), updateMarketingBannerValidator], updateMarketingBannerFn)
  app.post("/marketingBanner/delete", [authorization], deleteMarketingBannerFn);
  app.put("/marketingBanner/status", [authorization], statusUpdateMarketingBannerFn);

  //////////////------ feature section ----////////////////

  app.post("/featureSection/add", [authorization, reqSingleImageParser("image")], addFeatureSectionFn )
  app.get("/featureSection", [authorization], getAllFeatureSectionFn);
  app.put("/featureSection/edit",[authorization, reqSingleImageParser("image")], updateFeatureSectionFn)
  app.post("/featureSection/delete", [authorization], deleteFeatureSectionFn);
  app.put("/featureSection/status", [authorization], statusUpdateFeatureSectionFn);

    //////////////------ marketing Popup ----////////////////

    app.post("/marketingPopup/add", [authorization, reqSingleImageParser("image")], addMarketingPopupFn )
    app.get("/marketingPopup", [authorization], getAllMarketingPopupFn);
    app.put("/marketingPopup/edit",[authorization, reqSingleImageParser("image")], updateMarketingPopupFn)
    app.post("/marketingPopup/delete", [authorization], deleteMarketingPopupFn);
    app.put("/marketingPopup/status", [authorization], statusUpdateMarketingPopupFn);
};
