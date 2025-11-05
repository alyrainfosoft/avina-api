import { Router } from "express";
import {
  getAll3MarketingBannersFn,
  getAllOurStoryListFn,
  getAllBannersFn,
  getAllFeaturesSectionsFn,
  getAllHomeAndAboutSectionFn,
  getMarketingPopupFn,
  getAllTemplateTwoBannersUserFn,
  getAllTemplateTwoFeaturesSectionsUserFn,
  getTemplateTwoMarketingPopupUserFn,
  getAllTemplateTwoHomeAboutBannersUserFn,
  getAllTemplateTwoHomeAboutFeatureSectionUserFn,
  getAllTemplateTwoHomeAboutMarketingSectionUserFn,
  getAllTemplateTwoMarketingBannerUserFn,
  getTemplateThreeBannerFn,
  getTemplateThreeJewelrySectionFn,
  getTemplateThreeDiamondSectionFn,
  getTemplateThreeCategorySectionFn,
  getTemplateFiveProductModelForUserFn,
  getTemplateThreeProductModelForUserFn,
  getTheProcessFn,
  getBestSellProductFn,
  getALlNewArriveProductFn,
} from "../../../controllers/Frontend/homePage.controller";

export default (app: Router) => {
  app.get("/banner", getAllBannersFn);
  app.get("/marketing/banner", getAll3MarketingBannersFn);
  app.get("/homeAndAbout/section", getAllHomeAndAboutSectionFn);
  app.get("/features/section", getAllFeaturesSectionsFn);
  app.get("/marketing/popup", getMarketingPopupFn);
  // app.get("/our-story/list", getAllOurStoryListFn);
  app.get("/the-process", getTheProcessFn);
  app.get("/new-product", getALlNewArriveProductFn);
  app.get("/best-product", getBestSellProductFn);

  /////--------- Template Two Frontend API -----------/////////////
  app.get("/template/two/banner", getAllTemplateTwoBannersUserFn);
  app.get(
    "/template/two/features-section",
    getAllTemplateTwoFeaturesSectionsUserFn
  );
  // app.get(
  //   "/template/two/marketingPopup",
  //   getTemplateTwoMarketingPopupUserFn
  // );
  app.get(
    "/template/two/home-about/banner",
    getAllTemplateTwoHomeAboutBannersUserFn
  );
  app.get(
    "/template/two/home-about/features-section",
    getAllTemplateTwoHomeAboutFeatureSectionUserFn
  );
  app.get(
    "/template/two/home-about/marketing-section",
    getAllTemplateTwoHomeAboutMarketingSectionUserFn
  );
  app.get(
    "/template/two/marketing-section",
    getAllTemplateTwoMarketingBannerUserFn
  );

  /////--------- Template Three Frontend API -----------/////////////

  app.get("/template-three/banner", getTemplateThreeBannerFn);
  app.get(
    "/template-three/jewelry-section",
    getTemplateThreeJewelrySectionFn
  );
  app.get(
    "/template-three/diamond-section",
    getTemplateThreeDiamondSectionFn
  );
  app.get(
    "/template-three/category-section",
    getTemplateThreeCategorySectionFn
  );
  // app.get(
  //   "/template-five/product-model",
  //   getTemplateFiveProductModelForUserFn
  // );
  app.get(
    "/template-three/product-model",
    getTemplateThreeProductModelForUserFn
  );
};
