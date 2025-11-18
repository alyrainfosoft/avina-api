import { Router } from "express";

import { reqAnyTypeImageAnyFormat, reqSingleImageParser } from "../../../middlewares/multipart-file-parser";
import { authorization } from "../../../middlewares/authenticate";
import { addTemplateTwoBannerFn, addTemplateTwoFeatureSectionFn, addTemplateTwoHomeAboutBannerFn, addTemplateTwoHomeAboutFeatureSectionFn, addTemplateTwoHomeAboutMarketingSectionFn, addTemplateTwoMarketingPopupFn, addTemplateTwoMarketingSectionFn, addTemplateTwoProductsFn, deleteTemplateTwoBannerFn, deleteTemplateTwoFeatureSectionFn, deleteTemplateTwoHomeAboutBannerFn, deleteTemplateTwoHomeAboutFeatureSectionFn, deleteTemplateTwoHomeAboutMarketingSectionFn, deleteTemplateTwoMarketingPopupFn, deleteTemplateTwoMarketingSectionFn, getAllTemplateTwoBannersFn, getAllTemplateTwoFeatureSectionFn, getAllTemplateTwoHomeAboutBannerFn, getAllTemplateTwoHomeAboutFeatureSectionFn, getAllTemplateTwoHomeAboutMarketingSectionFn, getAllTemplateTwoMarketingPopupFn, getAllTemplateTwoMarketingSectionFn, getAllTemplateTwoProductSectionUserFn, getALlTemplateTwoProductsFn, statusUpdateTemapleTwoBannerFn, statusUpdateTemapleTwoMarketingSectionFn, statusUpdateTemplateTwoFeatureSectionFn, statusUpdateTemplateTwoHomeAboutBannerFn, statusUpdateTemplateTwoHomeAboutFeatureSectionFn, statusUpdateTemplateTwoHomeAboutMarketingSectionFn, statusUpdateTemplateTwoMarketingPopupFn, updateTemplateTwoBannerFn, updateTemplateTwoFeatureSectionFn, updateTemplateTwoHomeAboutBannerFn, updateTemplateTwoHomeAboutFeatureSectionFn, updateTemplateTwoHomeAboutMarketingSectionFn, updateTemplateTwoMarketingPopupFn, updateTemplateTwoMarketingSectionFn, updateTemplateTwoProductsFn } from "../../controllers/tempate-2-banner.controller";
import { productSKUListFn } from "../../controllers/template-six.controller";

export default (app: Router) => {
  app.post(
    "/template/two/banners",
    [authorization, reqSingleImageParser("image")],
    addTemplateTwoBannerFn
  );

  app.put(
    "/template/two/banners/edit",
    [authorization, reqSingleImageParser("image")],
    updateTemplateTwoBannerFn
  );

  app.post("/template/two/banners/delete", [authorization], deleteTemplateTwoBannerFn);

  app.get("/template/two/banners", [authorization], getAllTemplateTwoBannersFn);

  app.put("/template/two/banners/status", [authorization], statusUpdateTemapleTwoBannerFn);


  //////////////------ marketing banner ----////////////////

  app.post("/template/two/marketingBanner/add", [authorization, reqSingleImageParser("image")], addTemplateTwoMarketingSectionFn )
  app.get("/template/two/marketingBanner", [authorization], getAllTemplateTwoMarketingSectionFn);
  app.put("/template/two/marketingBanner/edit",[authorization, reqSingleImageParser("image")], updateTemplateTwoMarketingSectionFn)
  app.post("/template/two/marketingBanner/delete", [authorization], deleteTemplateTwoMarketingSectionFn);
  app.put("/template/two/marketingBanner/status", [authorization], statusUpdateTemapleTwoMarketingSectionFn);

  //////////////------ feature section ----////////////////

  app.post("/template/two/featureSection/add", [authorization, reqSingleImageParser("image")], addTemplateTwoFeatureSectionFn )
  app.get("/template/two/featureSection", [authorization], getAllTemplateTwoFeatureSectionFn);
  app.put("/template/two/featureSection/edit",[authorization, reqSingleImageParser("image")], updateTemplateTwoFeatureSectionFn)
  app.post("/template/two/featureSection/delete", [authorization], deleteTemplateTwoFeatureSectionFn);
  app.put("/template/two/featureSection/status", [authorization], statusUpdateTemplateTwoFeatureSectionFn);

    //////////////------ marketing Popup ----////////////////

    app.post("/template/two/marketingPopup/add", [authorization, reqSingleImageParser("image")], addTemplateTwoMarketingPopupFn )
    app.get("/template/two/marketingPopup", [authorization], getAllTemplateTwoMarketingPopupFn);
    app.put("/template/two/marketingPopup/edit",[authorization, reqSingleImageParser("image")], updateTemplateTwoMarketingPopupFn)
    app.post("/template/two/marketingPopup/delete", [authorization], deleteTemplateTwoMarketingPopupFn);
    app.put("/template/two/marketingPopup/status", [authorization], statusUpdateTemplateTwoMarketingPopupFn);

  //////////////------ Home about banner ----////////////////

  app.post(
    "/template/two/home-about/banners",
    [authorization, reqSingleImageParser("image")],
    addTemplateTwoHomeAboutBannerFn
  );

  app.put(
    "/template/two/home-about/banners/edit",
    [authorization, reqSingleImageParser("image")],
    updateTemplateTwoHomeAboutBannerFn
  );

  app.post("/template/two/home-about/banners/delete", [authorization], deleteTemplateTwoHomeAboutBannerFn);

  app.get("/template/two/home-about/banners", [authorization], getAllTemplateTwoHomeAboutBannerFn);

  app.put("/template/two/home-about/banners/status", [authorization], statusUpdateTemplateTwoHomeAboutBannerFn);

    //////////////------Home About feature section ----////////////////

    app.post("/template/two/home-about/featureSection/add", [authorization, reqSingleImageParser("image")], addTemplateTwoHomeAboutFeatureSectionFn )
    app.get("/template/two/home-about/featureSection", [authorization], getAllTemplateTwoHomeAboutFeatureSectionFn);
    app.put("/template/two/home-about/featureSection/edit",[authorization, reqSingleImageParser("image")], updateTemplateTwoHomeAboutFeatureSectionFn)
    app.post("/template/two/home-about/featureSection/delete", [authorization], deleteTemplateTwoHomeAboutFeatureSectionFn);
    app.put("/template/two/home-about/featureSection/status", [authorization], statusUpdateTemplateTwoHomeAboutFeatureSectionFn);

     //////////////------Home About marketing section ----////////////////

     app.post("/template/two/home-about/marketingSection/add", [authorization, reqAnyTypeImageAnyFormat()], addTemplateTwoHomeAboutMarketingSectionFn )
     app.get("/template/two/home-about/marketingSection", [authorization], getAllTemplateTwoHomeAboutMarketingSectionFn);
     app.put("/template/two/home-about/marketingSection/edit",[authorization, reqAnyTypeImageAnyFormat()], updateTemplateTwoHomeAboutMarketingSectionFn)
     app.post("/template/two/home-about/marketingSection/delete", [authorization], deleteTemplateTwoHomeAboutMarketingSectionFn);
     app.put("/template/two/home-about/marketingSection/status", [authorization], statusUpdateTemplateTwoHomeAboutMarketingSectionFn);

    ////////////------ new  and best selling product section ------///////////////////////
    app.post("/template/two/product-section", [reqSingleImageParser("image"),authorization], addTemplateTwoProductsFn )
    app.get("/template/two/product-section/:product_type", [authorization], getALlTemplateTwoProductsFn);
    app.put("/template/two/product-section/:id", [reqSingleImageParser("image"),authorization], updateTemplateTwoProductsFn)
    app.get("/template/two/user/product-section", [authorization], getAllTemplateTwoProductSectionUserFn);
  
    app.get("/template-2/product-sku",[authorization], productSKUListFn);
    
};
