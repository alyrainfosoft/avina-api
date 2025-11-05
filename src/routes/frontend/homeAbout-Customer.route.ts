import { Router } from "express";
import { getAll3MarketingBannersFn, getAllBannersFn, getAllFeaturesSectionsFn, getAllHomeAndAboutSectionFn, getMarketingPopupFn } from "../../controllers/Frontend/homePage.controller";

export default (app: Router) => {
app.get("/user/banner", getAllBannersFn);
app.get("/user/marketing/banner", getAll3MarketingBannersFn)
app.get("/user/homeAndAbout/section", getAllHomeAndAboutSectionFn)
app.get("/user/features/section", getAllFeaturesSectionsFn)
app.get("/user/marketing/popup", getMarketingPopupFn)
 }