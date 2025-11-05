import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addOffersSliderSection, deleteOffersSliderSection, getOffersSliderSection, statusUpdateForOffersSliderSection, updateOffersSliderSection } from "../services/templete-seven/offers-slider.service";
import { addOffersTopSection, deleteOfferTopSection, getOffersTopSection, statusUpdateForOffersTopSection, updateOffersTopSection } from "../services/templete-seven/offers-top.service";
import { addOffersBottomSection, deleteOfferBottomSection, getOffersBottomSection, statusUpdateForOffersBottomSection, updateOffersBottomSection } from "../services/templete-seven/offers-bottom.service";
import { addAndUpdateAttractiveJewellrySection, deleteAttractiveJewellrySection, getAttractiveJewellrySection, statusUpdateForAttractiveJewellrySection } from "../services/templete-seven/attractive-jewellry.service";
import { addJewellryCategoriesSection, deleteJewellryCategoriesSection, getJewellryCategoriesSection, statusUpdateForJewellryCategoriesSection, updateJewellryCategoriesSection } from "../services/templete-seven/jewellry-categories.service";
import { addAndUpdateStunningDesignSection, deleteStunningDesignSection, getStunningDesignSection, statusUpdateForStunningDesignSection } from "../services/templete-seven/stunning-design.service";
import { addFestiveSaleOfferSection, deleteFestiveSaleOfferSection, getFestiveSaleOfferSection, statusUpdateForFestiveSaleOfferSection, updateFestiveSaleOfferSection } from "../services/templete-seven/festive-sale-offers.service";
import { addAndUpdateDazzlingAndStylishSection, deleteDazzlingAndStylishSection, getDazzlingAndStylishSection, statusUpdateForDazzlingAndStylishSection } from "../services/templete-seven/dizzling-and-style.service";
import { addAndUpdateProductAndCategorySection, deleteProductAndCategorySection, getProductAndCategorySection, statusUpdateForProductAndCategorySection } from "../services/templete-seven/product-and-category.service";
import { addStunningJewelrySection, deleteStunningJewelrySection, getStunningJewelrySection, statusUpdateForStunningJewelrySection, updateStunningJewelrySection } from "../services/templete-seven/stunning-jewelry.service";
import { addLominousDesignSection, deleteLominousDesignSection, getLominousDesignSection, statusUpdateForLominousDesignSection, updateLominousDesignSection } from "../services/templete-seven/lominous-design.service";
import { addAndUpdatepdateTestimonialsSection, deleteTestimoninalsSection, getTestimonialsSection, statusUpdateForTestimonialsSection } from "../services/templete-seven/testimonials.service";
import { addTestimonialDetailSection, deleteTestimonialDetailSection, getTestimonialDetailSection, statusUpdateForTestimonialDetailSection, updateTestimonialDetailSection } from "../services/templete-seven/testimonials-details.service";
import { addBlogSection, deleteBlogSection, getBlogSection, statusUpdateForBlogSection, updateBlogSection } from "../services/templete-seven/blog.service";
import { templateSelevensAllSectionListForUser, templateSevensAllSectionDetailForUser } from "../services/templete-seven/all-section-user-side.service";
import { addTemplateSevenPoducts, getALlTemplateSevenProducts, updateTemplateSevenProducts } from "../services/templete-seven/product-section.service";

/* OffersSlider Section */
export const addOffersSliderSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addOffersSliderSection(req), "addOffersSliderSectionFn");
};

export const updateOffersSliderSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateOffersSliderSection(req), "updateOffersSliderSectionFn");
};

export const getOffersSliderSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getOffersSliderSection(req), "getOffersSliderSectionFn");
};

export const deleteOffersSliderSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteOffersSliderSection(req), "deleteOffersSliderSectionFn");
};

export const statusUpdateForOffersSliderSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForOffersSliderSection(req),
    "statusUpdateForOffersSliderSectionFn"
  );
};

/* OffersSlider Section */


/* OffersTop Section */
export const addOffersTopSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addOffersTopSection(req), "addOffersTopSectionFn");
};

export const updateOffersTopSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateOffersTopSection(req), "updateOffersTopSectionFn");
};

export const getOffersTopSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getOffersTopSection(req), "getOffersTopSectionFn");
};

export const deleteOffersTopSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteOfferTopSection(req), "deleteOffersTopSectionFn");
};

export const statusUpdateForOffersTopSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForOffersTopSection(req),
    "statusUpdateForOffersTopSectionFn"
  );
};

/* OffersTop Section */

/* OffersBottom Section */
export const addOffersBottomSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addOffersBottomSection(req), "addOffersBottomSectionFn");
};

export const updateOffersBottomSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateOffersBottomSection(req), "updateOffersBottomSectionFn");
};

export const getOffersBottomSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getOffersBottomSection(req), "getOffersBottomSectionFn");
};

export const deleteOffersBottomSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteOfferBottomSection(req), "deleteOffersBottomSectionFn");
};

export const statusUpdateForOffersBottomSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForOffersBottomSection(req),
    "statusUpdateForOffersBottomSectionFn"
  );
};

/* OffersBottom Section */


/* attractive-jewellry Section */

export const addAndUpdateAttractiveJewellrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addAndUpdateAttractiveJewellrySection(req), "addAndUpdateAttractiveJewellrySectionFn");
};

export const getAttractiveJewellrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAttractiveJewellrySection(req), "getAttractiveJewellrySectionFn");
};

export const deleteAttractiveJewellrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteAttractiveJewellrySection(req), "deleteAttractiveJewellrySectionFn");
};

export const statusUpdateForAttractiveJewellryFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForAttractiveJewellrySection(req),
    "statusUpdateForAttractiveJewellryFn"
  );
};

/* attractive-jewellry Section */


/* jewellry-categories Section */
export const addJewellryCategorisSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addJewellryCategoriesSection(req), "addJewellryCategorisSectionFn");
};

export const updateJewellryCategorisSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateJewellryCategoriesSection(req), "updateJewellryCategorisSectionFn");
};

export const getJewellryCategorisSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getJewellryCategoriesSection(req), "getJewellryCategorisSectionFn");
};

export const deleteJewellryCategorisSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteJewellryCategoriesSection(req), "deleteJewellryCategorisSectionFn");
};

export const statusUpdateForJewellryCategoriesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForJewellryCategoriesSection(req),
    "statusUpdateForJewellryCategorisFn"
  );
};

/* jewellry-categories Section */




/* stunning design Section */

export const addAndUpdateStunningDesignSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addAndUpdateStunningDesignSection(req), "addAndUpdateStunningDesignSectionFn");
};

export const getStunningDesignSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getStunningDesignSection(req), "getStunningDesignSectionFn");
};

export const deleteStunningDesignSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteStunningDesignSection(req), "deleteStunningDesignSectionFn");
};

export const statusUpdateForStunningDesignFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForStunningDesignSection(req),
    "statusUpdateForStunningDesignFn"
  );
};
/* stunning design Section */


/* festive sale offers Section */
export const addFestiveSaleOfferSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addFestiveSaleOfferSection(req), "addFestiveSaleOfferSectionFn");
};

export const updateFestiveSaleOfferSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateFestiveSaleOfferSection(req), "updateFestiveSaleOfferSectionFn");
};

export const getFestiveSaleOfferSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getFestiveSaleOfferSection(req), "getFestiveSaleOfferSectionFn");
};

export const deleteFestiveSaleOfferSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteFestiveSaleOfferSection(req), "deleteFestiveSaleOfferSectionFn");
};

export const statusUpdateForFestiveSaleOfferFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForFestiveSaleOfferSection(req),
    "statusUpdateForFestiveSaleOfferFn"
  );
};
/* festive sale offers Section */


/* dizzning and stylish Section */
export const addAndUpdateDazzlingAndStylishSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addAndUpdateDazzlingAndStylishSection(req), "addAndUpdateDazzlingAndStylishSectionFn");
};

export const getDazzlingAndStylishSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getDazzlingAndStylishSection(req), "getDazzlingAndStylishSectionFn");
};

export const deleteDazzlingAndStylishSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteDazzlingAndStylishSection(req), "deleteDazzlingAndStylishSectionFn");
};

export const statusUpdateForDazzlingAndStylishFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForDazzlingAndStylishSection(req),
    "statusUpdateForDizzningAndStylishFn"
  );
};
/* dizzning and stylish Section */


/* category and product Section */
export const addProductAndCategorySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addAndUpdateProductAndCategorySection(req), "addProductAndCategorySectionFn");
};

export const getProductAndCategorySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getProductAndCategorySection(req), "getProductAndCategorySectionFn");
};

export const deleteProductAndCategorySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteProductAndCategorySection(req), "deleteProductAndCategorySectionFn");
};

export const statusUpdateForProductAndCategorySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForProductAndCategorySection(req),
    "statusUpdateForProductAndCategorySectionFn"
  );
};
/* category and product Section */



/* stunning jewelry Section */
export const addStunningJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addStunningJewelrySection(req), "addStunningJewelrySectionFn");
};

export const updateStunningJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateStunningJewelrySection(req), "updateStunningJewelrySectionFn");
};

export const getStunningJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getStunningJewelrySection(req), "getStunningJewelrySectionFn");
};

export const deleteStunningJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteStunningJewelrySection(req), "deleteStunningJewelrySectionFn");
};

export const statusUpdateForStunningJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForStunningJewelrySection(req),
    "statusUpdateForStunningJewelrySectionFn"
  );
};
/* stunning jewelry Section */

/* lominous-design Section */
export const addLominousDesignSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addLominousDesignSection(req), "addLominousDesignSectionFn");
};

export const updateLominousDesignSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateLominousDesignSection(req), "updateLominousDesignSectionFn");
};

export const getLominousDesignSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getLominousDesignSection(req), "getLominousDesignSectionFn");
};

export const deleteLominousDesignSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteLominousDesignSection(req), "deleteLominousDesignSectionFn");
};

export const statusUpdateForLominousDesignSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForLominousDesignSection(req),
    "statusUpdateForLominousDesignSectionFn"
  );
};
/* lominous-design Section */


/* Testimonials Section */

export const addAndUpdatepdateTestimonialsSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addAndUpdatepdateTestimonialsSection(req), "addAndUpdatepdateTestimonialsSectionFn");
};

export const getTestimonialsSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getTestimonialsSection(req), "getTestimonialsSectionFn");
};

export const deleteTestimoninalsSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteTestimoninalsSection(req), "deleteTestimoninalsSectionFn");
};

export const statusUpdateForTestimonialsSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForTestimonialsSection(req),
    "statusUpdateForTestimonialsSectionFn"
  );
};

/* Testimonials Section */

/* TestimonialsDetails Section */
export const addTestimonialsDetailsSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addTestimonialDetailSection(req), "addTestimonialsDetailsSectionFn");
};

export const updateTestimonialDetailSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateTestimonialDetailSection(req), "updateTestimonialDetailSectionFn");
};

export const getTestimonialsDetailsSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getTestimonialDetailSection(req), "getTestimonialsDetailsSectionFn");
};

export const deleteTestimonialDetailSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteTestimonialDetailSection(req), "deleteTestimonialDetailSectionFn");
};

export const statusUpdateForTestimonialDetailSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForTestimonialDetailSection(req),
    "statusUpdateForTestimonialDetailSectionFn"
  );
};

/* TestimonialsDetails Section */


/* Blog Section */
export const addBlogSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addBlogSection(req), "addBlogSectionFn");
};

export const updateBlogSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateBlogSection(req), "updateBlogSectionFn");
};

export const getBlogSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getBlogSection(req), "getBlogSectionFn");
};

export const deleteBlogSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteBlogSection(req), "deleteBlogSectionFn");
};

export const statusUpdateForBlogSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForBlogSection(req),
    "statusUpdateForBlogSectionFn"
  );
};

/* product Section */
export const addTemplateSevenPoductsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addTemplateSevenPoducts(req), "addTemplateSevenPoductsFn");
};

export const updateTemplateSevenProductsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateTemplateSevenProducts(req), "updateTemplateSevenProductsFn");
};

export const getALlTemplateSevenProductsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getALlTemplateSevenProducts(req), "getALlTemplateSevenProductsFn");
};

/* product Section */

/* blog  Section */

export const templateSevensAllSectionListForUserFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, templateSelevensAllSectionListForUser(req), "templateSevensAllSectionListForUserFn");
};

export const templateSevensAllSectionDetailForUserFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, templateSevensAllSectionDetailForUser(req), "templateSevensAllSectionDetailForUserFn");
};