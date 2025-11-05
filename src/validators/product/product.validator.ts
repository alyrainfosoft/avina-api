import { RequestHandler } from "express";
import modelValidator from "../model.validator";
import {
  activeInactiveProductRule,
  addProductCartListRules,
  addProductImagesRules,
  addProductVideoRules,
  addProductWishListRules,
  addProductWithVariantRules,
  birthstoneProductDetailRules,
  deleteCartProductRules,
  deleteProductImageRules,
  deleteProductRule,
  deleteProductVideoRules,
  featuredProductRule,
  saveProductBasicDetailsRule,
  saveProductMetalDiamondDetailsRule,
  trendingProductRule,
} from "./product.rules";

export const activeInactiveProductValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, activeInactiveProductRule);
};

export const featuredProductValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, featuredProductRule);
};
export const trendingProductValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, trendingProductRule);
};
export const deleteProductValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, deleteProductRule);
};

export const saveProductBasicDetailsValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, saveProductBasicDetailsRule);
};

export const saveProductMetalDiamondDetailsValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(
    req,
    res,
    next,
    saveProductMetalDiamondDetailsRule
  );
};

export const addProductImagesValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, addProductImagesRules);
};

export const addProductVideoValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, addProductVideoRules);
};

export const deleteProductImageValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, deleteProductImageRules);
};

export const deleteProductVideoValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, deleteProductVideoRules);
};

export const addProductWishListValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, addProductWishListRules);
};

export const birthstoneProductDetailValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, birthstoneProductDetailRules);
};

export const deleteCartProductValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, deleteCartProductRules);
};

export const addProductCartListValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, addProductCartListRules);
};

export const addProductWithVariantValidator: RequestHandler = async (
  req,
  res,
  next
) => {
  return await modelValidator(req, res, next, addProductWithVariantRules);
};