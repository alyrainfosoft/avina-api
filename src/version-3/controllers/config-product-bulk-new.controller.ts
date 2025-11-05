import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addConfigProductsFromNewCSVFile,
  getAllConfigProducts,
  newConfigProductPriceFind,
} from "../services/config-product-bulk-new.service";
import {
  addAllConfigProductsFromNewCSVFile,
  configProductDeleteApi,
} from "../services/config-all-product-bulk-upload.service";
import {
  addRetailConfigProductsFromCSVFile,
  configProductMazzsRetailPriceFind,
  configProductRetailPriceFind,
  publicConfigProductRetailPriceFind,
  threeStoneProductRetailPriceFind,
} from "../services/retail-discount-config-product-bulk-upload.service";

export const addConfigProductsFromNewCSVFileFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addConfigProductsFromNewCSVFile(req),
    "addConfigProductsFromNewCSVFileFn"
  );
};

export const newConfigProductPriceFindFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    newConfigProductPriceFind(req),
    "newConfigProductPriceFindFn"
  );
};

export const getAllConfigProductsFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getAllConfigProducts(req),
    "exportConfigProductFn"
  );
};

/*---------------- All config product add ----------------*/

export const addAllConfigProductsFromNewCSVFileFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    addAllConfigProductsFromNewCSVFile(req),
    "addAllConfigProductsFromNewCSVFileFn"
  );
};

/*----------------- retail & discount Config product add -------------*/

export const addRetailConfigProductsFromCSVFileFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    addRetailConfigProductsFromCSVFile(req),
    "addRetailConfigProductsFromCSVFileFn"
  );
};

export const configProductRetailPriceFindFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    configProductRetailPriceFind(req),
    "configProductRetailPriceFindFn"
  );
};

export const publicConfigProductRetailPriceFindFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    publicConfigProductRetailPriceFind(req),
    "configProductRetailPriceFindFn"
  );
};

/*------------------- Three stone config product ----------------------------*/

export const threeStoneProductRetailPriceFindFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    threeStoneProductRetailPriceFind(req),
    "threeStoneProductRetailPriceFindFn"
  );
};

/*------------- config product price mazz ------------------*/

export const configProductMazzsRetailPriceFindFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    configProductMazzsRetailPriceFind(req),
    "configProductMazzsRetailPriceFindFn"
  );
};

/* ------------ config product delete ---------------- */

export const configProductDeleteApiFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    configProductDeleteApi(req),
    "configProductDeleteApiFn"
  );
};
