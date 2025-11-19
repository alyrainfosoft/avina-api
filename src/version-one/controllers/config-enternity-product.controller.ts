import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addConfigEternityProduct,
  deleteEternityProduct,
  eternityPriceFind,
  eternityProductPriceFindWithoutUsingMaterializedView,
  getEternityProduct,
  getEternityProductDetailForUser,
  getEternityProductList,
} from "../services/config-eternity-product-bulk-upload.service";

export const addConfigEternityProductFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addConfigEternityProduct(req),
    "addConfigProductsFromNewCSVFileFn"
  );
};

export const getConfigEternityProductsFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getEternityProductList(req),
    "getAllConfigProduct"
  );
};

export const getByIdConfigEternityProduct: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getEternityProduct(req), "getAllConfigProduct");
};

export const deleteConfigEternityProductFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteEternityProduct(req),
    "getAllConfigProduct"
  );
};

export const eternityPriceFindFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, eternityPriceFind(req), "eternityPriceFindFn");
};

export const eternityProductPriceFindWithoutUsingMaterializedViewFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, eternityProductPriceFindWithoutUsingMaterializedView(req), "eternityProductPriceFindWithoutUsingMaterializedViewFn");
};

export const getEternityProductDetailForUserFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getEternityProductDetailForUser(req),
    "getEternityProductDetailForUserFn"
  );
};
