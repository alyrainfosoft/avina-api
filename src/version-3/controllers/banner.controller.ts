import { RequestHandler } from "express";
import {
  addBanner,
  deleteBanner,
  getAllBanners,
  statusUpdateBanner,
  updateBanner,
} from "../services/banners/banner.service";
import { addFeaturesSections, deleteFeatureSection, getAllFeaturesSections, statusUpdateFeatureSection, updateFeaturesSections } from "../services/banners/featuresSections.service";
import { addMarketingPopup, deleteMarketingPopup, getAllMarketingPopup, statusUpdateMarketingPopup, updateMarketingPopup } from "../services/banners/marketing-popup.service";
import { addMarketingBanner, deleteMarkingBanner, getAllMarketingBanner, statusUpdateMarkingBanner, updateMarketingBanner } from "../services/banners/marketing.service";
import { callServiceMethod } from "./base.controller";
import { addOurStory, deleteOurStory, getAllOurstory, getByIdOurstory, statusUpdateOurStory, updateOurStory } from "../services/banners/our-story.service";

export const addBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addBanner(req), "addBannerFn");
};

export const updateBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateBanner(req), "updateBannerFn");
};

export const deleteBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteBanner(req), "deleteBannerFn");
};

export const getAllBannersFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllBanners(req), "getAllBannersFn");
};

export const statusUpdateBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateBanner(req), "statusUpdateBannerFn");
}
////////////------ marketing banner ------///////////////////////

export const addMarketingBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addMarketingBanner(req), "addMarketingBannerFn");
};

export const updateMarketingBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateMarketingBanner(req), "updateMarketingBannerFn");
};

export const getAllMarketingBannersFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllMarketingBanner(req), "getAllMarketingBannersFn");
};

export const deleteMarketingBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteMarkingBanner(req), "deleteMarketingBannerFn");
};

export const statusUpdateMarketingBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateMarkingBanner(req), "statusUpdateMarketingBannerFn")
}

////////////------ features Sections ------///////////////////////

export const addFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addFeaturesSections(req), "addFeatureSectionFn");
};

export const updateFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateFeaturesSections(req), "updateFeatureSectionFn");
};

export const getAllFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllFeaturesSections(req), "getAllFeatureSectionFn");
};

export const deleteFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteFeatureSection(req), "deleteFeatureSectionFn");
};

export const statusUpdateFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateFeatureSection(req), "statusUpdateFeatureSectionFn")
}

////////////------ marketing Popup ------///////////////////////

export const addMarketingPopupFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addMarketingPopup(req), "addMarketingPopupFn");
};

export const updateMarketingPopupFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateMarketingPopup(req), "updateMarketingPopupFn");
};

export const getAllMarketingPopupFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllMarketingPopup(req), "getAllMarketingPopupFn");
};

export const deleteMarketingPopupFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteMarketingPopup(req), "deleteMarketingPopupFn");
};

export const statusUpdateMarketingPopupFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateMarketingPopup(req), "statusUpdateMarketingPopupFn")
}

////////////------ Our story ------///////////////////////

export const addOurStoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addOurStory(req), "addOurStoryFn");
};

export const updateOurStoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateOurStory(req), "updateOurStoryFn");
};

export const getAllOurstoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllOurstory(req), "getAllOurstoryFn");
};

export const deleteOurStoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteOurStory(req), "deleteOurStoryFn");
};

export const statusUpdateOurStoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateOurStory(req), "statusUpdateOurStoryFn")
}

export const getByIdOurstoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdOurstory(req), "getByIdOurstoryFn")
}