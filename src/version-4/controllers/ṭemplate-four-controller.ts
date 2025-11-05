import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addBannerSection, deleteBannerSection, getBannerSection, statusUpdateForBannerSection, updateBannerSection } from "../services/templete-four/banner.service";
import { addAndUpdatepdateJewelrySection, deleteJewelrySection, getJewelrySection, statusUpdateForJewelrySection } from "../services/templete-four/jewelry-section.service";
import { addAndUpdatePerfectJewelrySection, deletePerfectJewelrySection, getPerfectJewelrySection, statusUpdateForPerfectJewelrySection } from "../services/templete-four/perfect-jewelry.service";
import { addJewellryCategoriesSection, deleteJewellryCategoriesSection, getJewellryCategoriesSection, statusUpdateForJewellryCategoriesSection, updateJewellryCategoriesSection } from "../services/templete-four/jewellry-categories.service";
import { authorization } from "../../middlewares/authenticate";
import { addUpdateTemplateFourProducts, getALlTemplateFourProducts } from "../services/templete-four/product-section.service";
import { addProductAndCategorySection, deleteProductAndCategorySection, getProductAndCategorySection, statusUpdateForProductAndCategorySection, updateProductAndCategorySection } from "../services/templete-four/product-and-category.service";
import { addAntiqueSection, deleteAntiqueSection, getAntiqueSection, statusUpdateForAntiqueSection, updateAntiqueSection } from "../services/templete-four/antique.service";
import { addAncientSection, deleteAncientSection, getAncientSection, statusUpdateForAncientSection, updateAncientSection } from "../services/templete-four/ancient.service";
import { addJournalSection, deleteJournalSection, getJournalSection, statusUpdateForJournalSection, updateJournalSection } from "../services/templete-four/journal.service";
import { templateFoursAllSectionListForUser } from "../services/templete-four/all-section-user-side.service";
import { templateSevensAllSectionDetailForUser } from "../services/templete-seven/all-section-user-side.service";




/* Banner Section */
export const addBannerSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addBannerSection(req), "addBannerSectionFn");
};

export const updateBannerSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateBannerSection(req), "updateBannerSectionFn");
};

export const getBannerSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getBannerSection(req), "getBannerSectionFn");
};

export const deleteBannerSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteBannerSection(req), "deleteBannerSectionFn");
};

export const statusUpdateForBannerSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForBannerSection(req),
    "statusUpdateForBannerSectionFn"
  );
}

/* jewelry-section Section */
export const addAndUpdatepdateJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addAndUpdatepdateJewelrySection(req), "addAndUpdatepdateJewelrySectionFn");
};

export const getJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getJewelrySection(req), "getJewelrySectionFn");
};

export const deleteJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteJewelrySection(req), "deleteTestimoninalsSectionFn");
};

export const statusUpdateForJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForJewelrySection(req),
    "statusUpdateForJewelrySectionFn"
  );
}

/* perfect-section Section */
export const addAndUpdatePerfectJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addAndUpdatePerfectJewelrySection(req), "addAndUpdatePerfectJewelrySectionFn");
};

export const getPerfectJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getPerfectJewelrySection(req), "getPerfectJewelrySectionFn");
};

export const deletePerfectJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deletePerfectJewelrySection(req), "deletePerfectJewelrySectionFn");
};

export const statusUpdateForPerfectJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForPerfectJewelrySection(req),
    "statusUpdateForPerfectJewelrySectionFn"
  );
}

/* jewelry categories Section */
export const addJewellryCategoriesSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addJewellryCategoriesSection(req), "addJewellryCategoriesSectionFn");
};

export const updateJewellryCategoriesSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateJewellryCategoriesSection(req), "updateJewellryCategoriesSectionFn");
};

export const getJewellryCategoriesSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getJewellryCategoriesSection(req), "getJewellryCategoriesSectionFn");
};

export const deleteJewellryCategoriesSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteJewellryCategoriesSection(req), "deleteJewellryCategoriesSectionFn");
};

export const statusUpdateForJewellryCategoriesSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForJewellryCategoriesSection(req),
    "statusUpdateForJewellryCategoriesSectionFn"
  );
}

/* new collection product section */
  
export const addUpdateTemplateFourProductsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addUpdateTemplateFourProducts(req), "addUpdateTemplateFourProductsFn");
};

export const getALlTemplateFourProductsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getALlTemplateFourProducts(req), "getALlTemplateFourProductsFn");
};


/* product and category Section */
export const addProductAndCategorySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addProductAndCategorySection(req), "addProductAndCategorySectionFn");
};

export const updateProductAndCategorySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateProductAndCategorySection(req), "updateProductAndCategorySectionFn");
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
}


/* antique Section */
export const addAntiqueSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addAntiqueSection(req), "addAntiqueSectionFn");
};

export const updateAntiqueSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateAntiqueSection(req), "updateProductAndCategorySectionFn");
};

export const getAntiqueSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAntiqueSection(req), "getAntiqueSectionFn");
};

export const deleteAntiqueSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteAntiqueSection(req), "deleteAntiqueSectionFn");
};

export const statusUpdateForAntiqueSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForAntiqueSection(req),
    "statusUpdateForAntiqueSectionFn"
  );
}


/* ancient Section */
export const addAncientSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addAncientSection(req), "addAncientSectionFn");
};

export const updateAncientSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateAncientSection(req), "updateAncientSectionFn");
};

export const getAncientSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAncientSection(req), "getAncientSectionFn");
};

export const deleteAncientSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteAncientSection(req), "deleteAncientSectionFn");
};

export const statusUpdateForAncientSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForAncientSection(req),
    "statusUpdateForAncientSectionFn"
  );
}



/* jonral Section */
export const addJournalSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addJournalSection(req), "addJournalSectionFn");
};

export const updateJournalSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateJournalSection(req), "updateJournalSectionFn");
};

export const getJournalSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getJournalSection(req), "getJournalSectionFn");
};

export const deleteJournalSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteJournalSection(req), "deleteJournalSectionFn");
};

export const statusUpdateForJournalSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForJournalSection(req),
    "statusUpdateForJournalSectionFn"
  );
}

/* user side api */


export const templateFoursAllSectionListForUserFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, templateFoursAllSectionListForUser(req), "templateFoursAllSectionListForUserFn");
};

export const templateSevensAllSectionDetailForUserFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, templateSevensAllSectionDetailForUser(req), "templateSevensAllSectionDetailForUserFn");
};