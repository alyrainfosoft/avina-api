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
import { addTemplateTwoBanner, deleteTemplateTwoBanner, getAllTemplateTwoBanners, statusUpdateTemapleTwoBanner, updateTemplateTwoBanner } from "../services/template-2-banners/banner.service";
import { addTemplateTwoMarketingPopup, deleteTemplateTwoMarketingPopup, getAllTemplateTwoMarketingPopup, statusUpdateTemplateTwoMarketingPopup, updateTemplateTwoMarketingPopup } from "../services/template-2-banners/marketing-popup.service";
import { addTemplateTwoFeaturesSections, deleteTemplateTwoFeatureSection, getAllTemplateTwoFeaturesSections, statusUpdateTemplateTwoFeatureSection, updateTemplateTwoFeaturesSections } from "../services/template-2-banners/featuresSections.service";
import { addTemplateTwoHomeAboutBanner, deleteTemplateTwoHomeAboutBanner, getAllTemplateTwoHomeAboutBanners, statusUpdateTemapleTwoHomeAboutBanner, updateTemplateTwoHomeAboutBanner } from "../services/template-2-banners/home-about-banner.service";
import { addTemplateTwoHomeAboutFeaturesSections, deleteTemplateTwoHomeAboutFeatureSection, getAllTemplateTwoHomeAboutFeaturesSections, statusUpdateTemplateTwoHomeAboutFeatureSection, updateTemplateTwoHomeAboutFeaturesSections } from "../services/template-2-banners/home-about-features-Sections.service";
import { addTemplateTwoHomeAboutMarketingSection, deleteTemplateTwoHomeAboutMarketingSection, getAllTemplateTwoHomeAboutMarketingSection, statusUpdateTemapleTwoHomeAboutMarketingSection, updateTemplateTwoHomeAboutMarketingSection } from "../services/template-2-banners/home-about-marketing.service";
import { addTemplateTwoMarketingSection, deleteTemplateTwoMarketingSection, getAllTemplateTwoMarketingSection, statusUpdateTemapleTwoMarketingSection, updateTemplateTwoMarketingSection } from "../services/template-2-banners/marketing-section.service";

export const addTemplateTwoBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addTemplateTwoBanner(req), "addTemplateTwoBannerFn");
};

export const updateTemplateTwoBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateTemplateTwoBanner(req), "updateTemplateTwoBannerFn");
};

export const deleteTemplateTwoBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteTemplateTwoBanner(req), "deleteTemplateTwoBannerFn");
};

export const getAllTemplateTwoBannersFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllTemplateTwoBanners(req), "getAllTemplateTwoBannersFn");
};

export const statusUpdateTemapleTwoBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateTemapleTwoBanner(req), "statusUpdateTemapleTwoBannerFn");
}

////////////------ marketing Banner ------/////////////////////

export const addTemplateTwoMarketingSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addTemplateTwoMarketingSection(req), "addTemplateTwoMarketingSectionFn");
};

export const updateTemplateTwoMarketingSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateTemplateTwoMarketingSection(req), "updateTemplateTwoMarketingSectionFn");
};

export const deleteTemplateTwoMarketingSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteTemplateTwoMarketingSection(req), "deleteTemplateTwoMarketingSectionFn");
};

export const getAllTemplateTwoMarketingSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllTemplateTwoMarketingSection(req), "getAllTemplateTwoMarketingSectionFn");
};

export const statusUpdateTemapleTwoMarketingSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateTemapleTwoMarketingSection(req), "statusUpdateTemapleTwoMarketingSectionFn");
}

////////////------ marketing Popup ------///////////////////////

export const addTemplateTwoMarketingPopupFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addTemplateTwoMarketingPopup(req), "addTemplateTwoMarketingPopupFn");
};

export const updateTemplateTwoMarketingPopupFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateTemplateTwoMarketingPopup(req), "updateTemplateTwoMarketingPopupFn");
};

export const getAllTemplateTwoMarketingPopupFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllTemplateTwoMarketingPopup(req), "getAllTemplateTwoMarketingPopupFn");
};

export const deleteTemplateTwoMarketingPopupFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteTemplateTwoMarketingPopup(req), "deleteTemplateTwoMarketingPopupFn");
};

export const statusUpdateTemplateTwoMarketingPopupFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateTemplateTwoMarketingPopup(req), "statusUpdateTemplateTwoMarketingPopupFn")
}

////////////------ features Sections ------///////////////////////

export const addTemplateTwoFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addTemplateTwoFeaturesSections(req), "addFeatureSectionFn");
};

export const updateTemplateTwoFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateTemplateTwoFeaturesSections(req), "updateTemplateTwoFeatureSectionFn");
};

export const getAllTemplateTwoFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllTemplateTwoFeaturesSections(req), "getAllTemplateTwoFeatureSectionFn");
};

export const deleteTemplateTwoFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteTemplateTwoFeatureSection(req), "deleteTemplateTwoFeatureSectionFn");
};

export const statusUpdateTemplateTwoFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateTemplateTwoFeatureSection(req), "statusUpdateTemplateTwoFeatureSectionFn")
}

////////////------ Home about banner ------///////////////////////

export const addTemplateTwoHomeAboutBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addTemplateTwoHomeAboutBanner(req), "addTemplateTwoHomeAboutBannerFn");
};

export const updateTemplateTwoHomeAboutBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateTemplateTwoHomeAboutBanner(req), "updateTemplateTwoHomeAboutBannerFn");
};

export const getAllTemplateTwoHomeAboutBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllTemplateTwoHomeAboutBanners(req), "getAllTemplateTwoHomeAboutBannerFn");
};

export const deleteTemplateTwoHomeAboutBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteTemplateTwoHomeAboutBanner(req), "deleteTemplateTwoHomeAboutBannerFn");
};

export const statusUpdateTemplateTwoHomeAboutBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateTemapleTwoHomeAboutBanner(req), "statusUpdateTemplateTwoHomeAboutBannerFn")
}

////////////------ Home About features Sections ------///////////////////////

export const addTemplateTwoHomeAboutFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addTemplateTwoHomeAboutFeaturesSections(req), "addTemplateTwoHomeAboutFeatureSectionFn");
};

export const updateTemplateTwoHomeAboutFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateTemplateTwoHomeAboutFeaturesSections(req), "updateTemplateTwoHomeAboutFeatureSectionFn");
};

export const getAllTemplateTwoHomeAboutFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllTemplateTwoHomeAboutFeaturesSections(req), "getAllTemplateTwoHomeAboutFeatureSectionFn");
};

export const deleteTemplateTwoHomeAboutFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteTemplateTwoHomeAboutFeatureSection(req), "deleteTemplateTwoHomeAboutFeatureSectionFn");
};

export const statusUpdateTemplateTwoHomeAboutFeatureSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateTemplateTwoHomeAboutFeatureSection(req), "statusUpdateTemplateTwoHomeAboutFeatureSectionFn")
}


////////////------ Home About Marketing Sections ------///////////////////////

export const addTemplateTwoHomeAboutMarketingSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addTemplateTwoHomeAboutMarketingSection(req), "addTemplateTwoHomeAboutMarketingSectionFn");
};

export const updateTemplateTwoHomeAboutMarketingSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateTemplateTwoHomeAboutMarketingSection(req), "updateTemplateTwoHomeAboutMarketingSectionFn");
};

export const getAllTemplateTwoHomeAboutMarketingSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllTemplateTwoHomeAboutMarketingSection(req), "getAllTemplateTwoHomeAboutMarketingSectionFn");
};

export const deleteTemplateTwoHomeAboutMarketingSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteTemplateTwoHomeAboutMarketingSection(req), "deleteTemplateTwoHomeAboutMarketingSectionFn");
};

export const statusUpdateTemplateTwoHomeAboutMarketingSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateTemapleTwoHomeAboutMarketingSection(req), "statusUpdateTemplateTwoHomeAboutMarketingSectionFn")
}

