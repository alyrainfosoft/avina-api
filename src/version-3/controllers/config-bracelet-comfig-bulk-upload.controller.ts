import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addConfigBraceletProduct,
  braceletConfiguratorProductPriceFind,
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

export const braceletConfiguratorProductPriceFindFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    braceletConfiguratorProductPriceFind(req),
    "braceletConfiguratorProductPriceFindFn"
  );
};
