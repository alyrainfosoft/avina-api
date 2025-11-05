import { RequestHandler } from "express";
import { getAll3MarketingBanners, getAllBanners, getAllFeaturesSections, getAllHomeAndAboutSection, getMarketingPopup } from "../../services/frontend/homePage.service";
import { callServiceMethod } from "../base.controller";

export const getAllBannersFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllBanners(req), "getAllBannersFn");
}

export const getAll3MarketingBannersFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAll3MarketingBanners(req), "getAll3MarketingBannersFn");
}

export const getAllHomeAndAboutSectionFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllHomeAndAboutSection(req), "getAllHomeAndAboutSectionFn");
}

export const getAllFeaturesSectionsFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllFeaturesSections(req), "getAllFeaturesSectionsFn");
}

export const getMarketingPopupFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getMarketingPopup(req), "getMarketingPopupFn");
}