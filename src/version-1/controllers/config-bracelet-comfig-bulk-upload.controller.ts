import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addConfigBraceletProduct,
  braceletConfiguratorProductPriceFindWithUsingMaterializedView,
  braceletConfiguratorProductPriceFindWithoutUsingMaterializedView,
  deleteBraceletConfiguratorProduct,
  getBraceletConfiguratorProductDetail,
  getBraceletConfiguratorProductDetailForUser,
  getBraceletConfiguratorProductList,
} from "../services/config-bracelet-product-bulk-upload.service";

export const addConfigBraceletProductFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addConfigBraceletProduct(req),
    "addConfigBraceletProductFn"
  );
};

export const getBraceletConfiguratorProductListFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    getBraceletConfiguratorProductList(req),
    "getBraceletConfiguratorProductListFn"
  );
};

export const getBraceletConfiguratorProductDetailFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    getBraceletConfiguratorProductDetail(req),
    "getBraceletConfiguratorProductDetailFn"
  );
};

export const getBraceletConfiguratorProductDetailForUserFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    getBraceletConfiguratorProductDetailForUser(req),
    "getBraceletConfiguratorProductDetailForUserFn"
  );
};

export const deleteBraceletConfiguratorProductFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    deleteBraceletConfiguratorProduct(req),
    "deleteBraceletConfiguratorProductFn"
  );
};

export const braceletConfiguratorProductPriceFindWithUsingMaterializedViewFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    braceletConfiguratorProductPriceFindWithUsingMaterializedView(req),
    "braceletConfiguratorProductPriceFindWithUsingMaterializedViewFn"
  );
};

export const braceletConfiguratorProductPriceFindWithoutUsingMaterializedViewFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    braceletConfiguratorProductPriceFindWithoutUsingMaterializedView(req),
    "braceletConfiguratorProductPriceFindWithoutUsingMaterializedViewFn"
  );
};