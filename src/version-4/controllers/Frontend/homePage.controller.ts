import { RequestHandler } from "express";
import {
  getAll3MarketingBanners,
  getAllOurStoryList,
  getAllBanners,
  getAllFeaturesSections,
  getAllHomeAndAboutSection,
  getMarketingPopup,
  getAllTemplateTwoBannersUser,
  getAllTemplateTwoFeaturesSectionsUser,
  getTemplateTwoMarketingPopupUser,
  getAllTemplateTwoHomeAboutBannersUser,
  getAllTemplateTwoHomeAboutFeatureSectionUser,
  getAllTemplateTwoHomeAboutMarketingSectionUser,
  getAllTemplateTwoMarketingBannerUser,
  getTemplateThreeBanner,
  getTemplateThreeCategorySection,
  getTemplateThreeJewelrySection,
  getTemplateThreeDiamondSection,
  getTemplateFiveProductModelForUser,
  getTemplateThreeProductModelForUser,
  getTheProcess,
  getBestSellProduct,
  getALlNewArriveProduct,
} from "../../services/frontend/homePage.service";
import { callServiceMethod } from "../base.controller";

export const getAllBannersFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllBanners(req), "getAllBannersFn");
};

export const getAll3MarketingBannersFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getAll3MarketingBanners(req),
    "getAll3MarketingBannersFn"
  );
};

export const getAllHomeAndAboutSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getAllHomeAndAboutSection(req),
    "getAllHomeAndAboutSectionFn"
  );
};

export const getAllFeaturesSectionsFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getAllFeaturesSections(req),
    "getAllFeaturesSectionsFn"
  );
};

export const getMarketingPopupFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getMarketingPopup(req), "getMarketingPopupFn");
};

export const getAllOurStoryListFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllOurStoryList(req), "getAll3OurStoryListFn");
};

////////------------- Template Two Frontend API---------////////////////

export const getAllTemplateTwoBannersUserFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getAllTemplateTwoBannersUser(req),
    "getAllTemplateTwoBannersUserFn"
  );
};

export const getAllTemplateTwoFeaturesSectionsUserFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    getAllTemplateTwoFeaturesSectionsUser(req),
    "getAllTemplateTwoFeaturesSectionsUserFn"
  );
};

export const getTemplateTwoMarketingPopupUserFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    getTemplateTwoMarketingPopupUser(req),
    "getTemplateTwoMarketingPopupUserFn"
  );
};
export const getAllTemplateTwoHomeAboutBannersUserFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    getAllTemplateTwoHomeAboutBannersUser(req),
    "getAllTemplateTwoHomeAboutBannersUserFn"
  );
};
export const getAllTemplateTwoHomeAboutFeatureSectionUserFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    getAllTemplateTwoHomeAboutFeatureSectionUser(req),
    "getAllTemplateTwoHomeAboutFeatureSectionUserFn"
  );
};
export const getAllTemplateTwoHomeAboutMarketingSectionUserFn: RequestHandler =
  (req, res) => {
    callServiceMethod(
      req,
      res,
      getAllTemplateTwoHomeAboutMarketingSectionUser(req),
      "getAllTemplateTwoHomeAboutMarketingSectionUserFn"
    );
  };

export const getAllTemplateTwoMarketingBannerUserFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    getAllTemplateTwoMarketingBannerUser(req),
    "getAllTemplateTwoMarketingBannerUserFn"
  );
};

////////------------- Template Three Frontend API---------////////////////

export const getTemplateThreeBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getTemplateThreeBanner(req),
    "getAllTemplateTwoMarketingBannerUserFn"
  );
};

export const getTemplateThreeCategorySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getTemplateThreeCategorySection(req),
    "getAllTemplateTwoMarketingBannerUserFn"
  );
};

export const getTemplateThreeJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getTemplateThreeJewelrySection(req),
    "getTemplateThreeJewelrySectionFn"
  );
};

export const getTemplateThreeDiamondSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getTemplateThreeDiamondSection(req),
    "getTemplateThreeDiamondSectionFn"
  );
};

export const getTemplateFiveProductModelForUserFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    getTemplateFiveProductModelForUser(req),
    "getTemplateFiveProductModelForUserFn"
  );
};
export const getTemplateThreeProductModelForUserFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    getTemplateThreeProductModelForUser(req),
    "getTemplateThreeProductModelForUserFn"
  );
};

export const getTheProcessFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getTheProcess(req), "getTheProcessFn");
};

export const getALlNewArriveProductFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getALlNewArriveProduct(req), "getALlNewArriveProductFn");
};

export const getBestSellProductFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getBestSellProduct(req), "getBestSellProductFn");
};