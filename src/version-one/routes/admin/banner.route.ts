import { Router } from "express";
import {
  addBannerFn,
  addFeatureSectionFn,
  addMarketingBannerFn,
  addMarketingPopupFn,
  addOurStoryFn,
  addTheProcessFn,
  addUpdateBannerProductsFn,
  addUpdateNewArriveProductFn,
  deleteBannerFn,
  deleteFeatureSectionFn,
  deleteMarketingBannerFn,
  deleteMarketingPopupFn,
  deleteOurStoryFn,
  deleteTheProcessFn,
  getALlBannerProductsFn,
  getAllBannersFn,
  getAllFeatureSectionFn,
  getAllMarketingBannersFn,
  getAllMarketingPopupFn,
  getALlNewArriveProductFn,
  getAllOurstoryFn,
  getAllTheProcesssFn,
  getByIdOurstoryFn,
  statusUpdateBannerFn,
  statusUpdateFeatureSectionFn,
  statusUpdateMarketingBannerFn,
  statusUpdateMarketingPopupFn,
  statusUpdateOurStoryFn,
  statusUpdateTheProcessFn,
  updateBannerFn,
  updateFeatureSectionFn,
  updateMarketingBannerFn,
  updateMarketingPopupFn,
  updateOurStoryFn,
  updateTheProcessFn,
} from "../../controllers/banner.controller";
import { reqMultiImageParser, reqSingleImageParser } from "../../../middlewares/multipart-file-parser";
import {
  addBannerValidator,
  addMarketingBannerValidator,
  addOurStoryValidator,
  updateBannerValidator,
  updateMarketingBannerValidator,
} from "../../../validators/banner/banner.validator";
import { authorization } from "../../../middlewares/authenticate";
import { addUpdateBannerProducts } from "../../services/banners/product.service";
import { addProductDropdownFn } from "../../controllers/masters/master.controller";

export default (app: Router) => {
  app.post(
    "/banners",
    [authorization, reqSingleImageParser("image")],
    addBannerFn
  );

  app.put(
    "/banners/edit",
    [authorization, reqSingleImageParser("image")],
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

  app.post("/featureSection/add", [authorization, reqMultiImageParser(["bg_image","image"])], addFeatureSectionFn )
  app.get("/featureSection", [authorization], getAllFeatureSectionFn);
  app.put("/featureSection/edit",[authorization, reqMultiImageParser(["bg_image","image"])], updateFeatureSectionFn)
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

  /* @product section */
  app.put("/banners/product", [authorization], addUpdateBannerProductsFn);
  app.get("/banners/product/:banner_type", [authorization], getALlBannerProductsFn);

    //////////////------ the process ----////////////////

  app.post("/the-process", [authorization], addTheProcessFn);
  app.get("/the-process", [authorization], getAllTheProcesssFn);
  app.put("/the-process",[authorization], updateTheProcessFn);
  app.delete("/the-process", [authorization], deleteTheProcessFn);
  app.patch("/the-process", [authorization], statusUpdateTheProcessFn);

  /* @new product section */
  app.put("/banners/new-product", [authorization], addUpdateNewArriveProductFn);
  app.get("/banners/new-product/:banner_type", [authorization], getALlNewArriveProductFn);
};
