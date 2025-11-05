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
  getProductModelForUserFn,
} from "../../controllers/Frontend/homePage.controller";

export default (app: Router) => {
  app.get("/user/banner", getAllBannersFn);
  app.get("/user/marketing/banner", getAll3MarketingBannersFn);
  app.get("/user/homeAndAbout/section", getAllHomeAndAboutSectionFn);
  app.get("/user/features/section", getAllFeaturesSectionsFn);
  app.get("/user/marketing/popup", getMarketingPopupFn);
  app.get("/user/our-story/list", getAllOurStoryListFn);

  /////--------- Template Two Frontend API -----------/////////////
  app.get("/template/two/banner/user", getAllTemplateTwoBannersUserFn);
  app.get(
    "/template/two/features-section/user",
    getAllTemplateTwoFeaturesSectionsUserFn
  );
  app.get(
    "/template/two/marketingPopup/user",
    getTemplateTwoMarketingPopupUserFn
  );
  app.get(
    "/template/two/home-about/banner/user",
    getAllTemplateTwoHomeAboutBannersUserFn
  );
  app.get(
    "/template/two/home-about/features-section/user",
    getAllTemplateTwoHomeAboutFeatureSectionUserFn
  );
  app.get(
    "/template/two/home-about/marketing-section/user",
    getAllTemplateTwoHomeAboutMarketingSectionUserFn
  );
  app.get(
    "/template/two/marketing-section/user",
    getAllTemplateTwoMarketingBannerUserFn
  );

  /////--------- Template Three Frontend API -----------/////////////

  app.get("/user/template-three/banner", getTemplateThreeBannerFn);
  app.get(
    "/user/template-three/jewelry-section",
    getTemplateThreeJewelrySectionFn
  );
  app.get(
    "/user/template-three/diamond-section",
    getTemplateThreeDiamondSectionFn
  );
  app.get(
    "/user/template-three/category-section",
    getTemplateThreeCategorySectionFn
  );
  app.get("/user/product-model", getProductModelForUserFn);
};
