import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addBanner,
  deleteBanner,
  getBanner,
  statusUpdateForBanner,
  updateBanner,
} from "../services/template-three/banner.service";
import {
  addCategorySection,
  deleteCategorySection,
  getCategorySection,
  statusUpdateForCategorySection,
  updateCategorySection,
} from "../services/template-three/category-section.service";
import {
  addJewelrySection,
  deleteJewelrySection,
  getJewelrySection,
  statusUpdateForJewelrySection,
  updateJewelrySection,
} from "../services/template-three/jewelry-section.service";
import {
  addDiamondSection,
  deleteDiamondSection,
  getDiamondSection,
  statusUpdateForDiamondSection,
  updateDiamondSection,
} from "../services/template-three/diamond-section.service";
import {
  addProductModel,
  deleteProductModel,
  getProductModel,
  statusUpdateForProductModel,
  updateProductModel,
} from "../services/template-three/product-model.service";

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

/* Category Section */

export const addCategorySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addCategorySection(req), "addCategorySectionFn");
};

export const updateCategorySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateCategorySection(req),
    "updateCategorySectionFn"
  );
};

export const getCategorySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getCategorySection(req), "getCategorySectionFn");
};

export const deleteCategorySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteCategorySection(req),
    "deleteCategorySectionFn"
  );
};

export const statusUpdateForCategorySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForCategorySection(req),
    "statusUpdateForCategorySectionFn"
  );
};

/* Jewelry Section */

export const addJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addJewelrySection(req), "addJewelrySectionFn");
};

export const updateJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateJewelrySection(req),
    "updateJewelrySectionFn"
  );
};

export const getJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getJewelrySection(req), "getJewelrySectionFn");
};

export const deleteJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteJewelrySection(req),
    "deleteJewelrySectionFn"
  );
};

export const statusUpdateForJewelrySectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForJewelrySection(req),
    "statusUpdateForJewelrySectionFn"
  );
};

/* diamond section */

export const addDiamondSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addDiamondSection(req), "addDiamondSectionFn");
};

export const updateDiamondSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateDiamondSection(req),
    "updateDiamondSectionFn"
  );
};

export const getDiamondSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getDiamondSection(req), "getDiamondSectionFn");
};

export const deleteDiamondSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteDiamondSection(req),
    "deleteDiamondSectionFn"
  );
};

export const statusUpdateForDiamondSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForDiamondSection(req),
    "statusUpdateForDiamondSectionFn"
  );
};

/* product models */

export const addProductModelFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addProductModel(req), "addProductModelFn");
};

export const updateProductModelFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateProductModel(req), "updateProductModelFn");
};

export const getProductModelFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getProductModel(req), "getProductModelFn");
};

export const deleteProductModelFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteProductModel(req), "deleteProductModelFn");
};

export const statusUpdateForProductModelFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForProductModel(req),
    "statusUpdateForProductModelFn"
  );
};
