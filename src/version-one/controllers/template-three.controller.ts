import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addSplashScreen,
  deleteSplashScreen,
  getSplashScreen,
  statusUpdateForSplashScreen,
  updateSplashScreen,
} from "../services/template-three/splash-screen.service";
import {
  addDiamondShapeSection,
  deleteDiamondShapeSection,
  getDiamondShapeSection,
  statusUpdateForDiamondShapeSection,
  updateDiamondShapeSection,
} from "../services/template-three/diamond-shape-section.service";
import {
  addShopBySection,
  deleteShopBySection,
  getShopBySection,
  statusUpdateForShopBySection,
  templateThreeAllSectionDetailForUser,
  templateThreeAllSectionListForUser,
  updateShopBySection,
} from "../services/template-three/shop-by-section.service";

/* slash screen Section */
export const addSplashScreenFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addSplashScreen(req), "addSlashScreenFn");
};

export const updateSplashScreenFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateSplashScreen(req), "updateSlashScreenFn");
};

export const getSplashScreenFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getSplashScreen(req), "getSlashScreenFn");
};

export const deleteSplashScreenFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteSplashScreen(req), "deleteSlashScreenFn");
};

export const statusUpdateForSplashScreenFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForSplashScreen(req),
    "statusUpdateForSlashScreenFn"
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

/* user API */

export const templateThreeAllSectionListForUserFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    templateThreeAllSectionListForUser(req),
    "templateThreeAllSectionListForUserFn"
  );
};

export const templateThreeAllSectionDetailForUserFn: RequestHandler = (
  req,
  res
) => {
  callServiceMethod(
    req,
    res,
    templateThreeAllSectionDetailForUser(req),
    "templateThreeAllSectionDetailForUserFn"
  );  
};
