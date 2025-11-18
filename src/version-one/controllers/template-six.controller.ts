import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addBanner,
  deleteBanner,
  getBanner,
  statusUpdateForBanner,
  templateSixAllSectionDetailForUser,
  templateSixAllSectionListForUser,
  updateBanner,
} from "../services/template-six/banner.service";
import {
  addDiamondShapeSection,
  deleteDiamondShapeSection,
  getDiamondShapeSection,
  statusUpdateForDiamondShapeSection,
  updateDiamondShapeSection,
} from "../services/template-six/diamond-shape-section.service";
import {
  addShopBySection,
  deleteShopBySection,
  getShopBySection,
  statusUpdateForShopBySection,
  templateThreeAllSectionDetailForUser,
  templateThreeAllSectionListForUser,
  updateShopBySection,
} from "../services/template-six/shop-by-section.service";
import {
  addSparkleSection,
  deleteSparkleSection,
  getSparkleSection,
  productSKUList,
  statusUpdateForSparkleSection,
  updateSparkleSection,
} from "../services/template-six/sparkling-section.service";
import {
  addShapeMarqueSection,
  deleteShapeMarqueSection,
  getShapeMarqueSection,
  statusUpdateForShapeMarqueSection,
  updateShapeMarqueSection,
} from "../services/template-six/shape-marque.service";
import {
  getInstagramSection,
  updateInstagramSection,
} from "../services/template-six/instagram-section.service";

/* Banner Section */
export const addBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addBanner(req), "addBannerFn");
};

export const updateBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateBanner(req), "updateBannerFn");
};

export const getBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getBanner(req), "getBannerFn");
};

export const deleteBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteBanner(req), "deleteBannerFn");
};

export const statusUpdateForBannerFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForBanner(req),
    "statusUpdateForBannerFn"
  );
};

/* diamond shape Section */

export const addDiamondShapeSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addDiamondShapeSection(req),
    "addDiamondShapeSectionFn"
  );
};

export const updateDiamondShapeSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateDiamondShapeSection(req),
    "updateDiamondShapeSectionFn"
  );
};

export const getDiamondShapeSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getDiamondShapeSection(req),
    "getDiamondShapeSectionFn"
  );
};

export const deleteDiamondShapeSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteDiamondShapeSection(req),
    "deleteDiamondShapeSectionFn"
  );
};

export const statusUpdateForDiamondShapeSectionFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForDiamondShapeSection(req),
    "statusUpdateForDiamondShapeSectionFn"
  );
};

/* shop by Section */

export const addShopBySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addShopBySection(req), "addShopBySectionFn");
};

export const updateShopBySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateShopBySection(req),
    "updateShopBySectionFn"
  );
};

export const getShopBySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getShopBySection(req), "getShopBySectionFn");
};

export const deleteShopBySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteShopBySection(req),
    "deleteShopBySectionFn"
  );
};

export const statusUpdateForShopBySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForShopBySection(req),
    "statusUpdateForShopBySectionFn"
  );
};

/* shape marque Section */

export const addShapeMarqueSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addShapeMarqueSection(req),
    "addShapeMarqueSectionFn"
  );
};

export const updateShapeMarqueSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateShapeMarqueSection(req),
    "updateShapeMarqueSectionFn"
  );
};

export const getShapeMarqueSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getShapeMarqueSection(req),
    "getShapeMarqueSectionFn"
  );
};

export const deleteShapeMarqueSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteShapeMarqueSection(req),
    "deleteShapeMarqueSectionFn"
  );
};

export const statusUpdateForShapeMarqueSectionFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForShapeMarqueSection(req),
    "statusUpdateForShapeMarqueSectionFn"
  );
};

/* sparkle Section */

export const addSparkleSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addSparkleSection(req), "addSparkleSectionFn");
};

export const updateSparkleSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateSparkleSection(req),
    "updateSparkleSectionFn"
  );
};

export const getSparkleSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getSparkleSection(req), "getSparkleSectionFn");
};

export const deleteSparkleSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteSparkleSection(req),
    "deleteSparkleSectionFn"
  );
};

export const statusUpdateForSparkleSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForSparkleSection(req),
    "statusUpdateForSparkleSectionFn"
  );
};
export const productSKUListFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, productSKUList(req), "productSKUList");
};
/* user API */

export const templateSixAllSectionListForUserFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    templateSixAllSectionListForUser(req),
    "templateSixAllSectionListForUserFn"
  );
};
export const templateSixAllSectionDetailForUserFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    templateSixAllSectionDetailForUser(req),
    "templateSixAllSectionDetailForUserFn"
  );
};

//---------------- insert section --------------------//

export const getInstagramSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getInstagramSection(req),
    "getInstagramSectionFn"
  );
};
export const updateInstagramSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateInstagramSection(req),
    "updateInstagramSectionFn"
  );
};
