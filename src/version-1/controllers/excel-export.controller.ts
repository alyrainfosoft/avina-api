import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  braceletConfiguratorProductExport,
  dynamicProductExport,
  eternityBandConfiguratorProductExport,
  ringConfiguratorProductExport,
  threeStoneConfiguratorProductExport,
  variantProductExport,
} from "../services/excel-export.service";

export const dynamicProductExportFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    dynamicProductExport(req),
    "dynamicProductExportFn"
  );
};

export const variantProductExportFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    variantProductExport(req),
    "variantProductExportFn"
  );
};

export const ringConfiguratorProductExportFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    ringConfiguratorProductExport(req),
    "ringConfiguratorProductExportFn"
  );
};

export const threeStoneConfiguratorProductExportFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    threeStoneConfiguratorProductExport(req),
    "threeStoneConfiguratorProductExportFn"
  );
};
export const eternityBandConfiguratorProductExportFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    eternityBandConfiguratorProductExport(req),
    "eternityBandConfiguratorProductExportFn"
  );
};

export const braceletConfiguratorProductExportFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    braceletConfiguratorProductExport(req),
    "braceletConfiguratorProductExportFn"
  );
};
