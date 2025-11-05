import { Router } from "express";
import {
  addBannerFn,
  addFeatureSectionFn,
  addMarketingBannerFn,
  addMarketingPopupFn,
  addOurStoryFn,
  deleteBannerFn,
  deleteFeatureSectionFn,
  deleteMarketingBannerFn,
  deleteMarketingPopupFn,
  deleteOurStoryFn,
  getAllBannersFn,
  getAllFeatureSectionFn,
  getAllMarketingBannersFn,
  getAllMarketingPopupFn,
  getAllOurstoryFn,
  getByIdOurstoryFn,
  statusUpdateBannerFn,
  statusUpdateFeatureSectionFn,
  statusUpdateMarketingBannerFn,
  statusUpdateMarketingPopupFn,
  statusUpdateOurStoryFn,
  updateBannerFn,
  updateFeatureSectionFn,
  updateMarketingBannerFn,
  updateMarketingPopupFn,
  updateOurStoryFn,
} from "../controllers/banner.controller";
import { getAllMainCategoryFn } from "../controllers/category.controller";
import { reqSingleImageParser } from "../../middlewares/multipart-file-parser";
import {
  addBannerValidator,
  addMarketingBannerValidator,
  addOurStoryValidator,
  updateBannerValidator,
  updateMarketingBannerValidator,
} from "../../validators/banner/banner.validator";
import { authorization } from "../../middlewares/authenticate";

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

  //////////////------ Our story ----////////////////

  app.post("/our-story/add", [authorization, reqSingleImageParser("image"), addOurStoryValidator], addOurStoryFn )
  app.get("/our-story", [authorization], getAllOurstoryFn);
  app.put("/our-story/edit",[authorization, reqSingleImageParser("image"), addOurStoryValidator], updateOurStoryFn)
  app.post("/our-story/delete", [authorization], deleteOurStoryFn);
  app.put("/our-story/status", [authorization], statusUpdateOurStoryFn);
  app.get("/our-story/:id", [authorization], getByIdOurstoryFn);

};
