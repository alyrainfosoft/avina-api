import { RequestHandler } from "express";
import {
  addMegaMenu,
  addMegaMenuAttribute,
  deleteMegaMenu,
  deleteMegaMenuAttribute,
  getMegaMenu,
  getMegaMenuAttribute,
  getMegaMenuAttributeDetail,
  getMegaMenuForUser,
  statusUpdateForMegaMenu,
  statusUpdateForMegaMenuAttribute,
  updateMegaMenu,
  updateMegaMenuAttribute,
  updateSortOrderMegaMenuAttribute,
} from "../services/mega-menu.service";
import { callServiceMethod } from "./base.controller";

/* mega menu */

export const addMegaMenuFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addMegaMenu(req), "addMegaMenuFn");
};

export const updateMegaMenuFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateMegaMenu(req), "updateMegaMenuFn");
};

export const getMegaMenuFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getMegaMenu(req), "getMegaMenuFn");
};

export const deleteMegaMenuFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteMegaMenu(req), "deleteMegaMenuFn");
};

export const statusUpdateForMegaMenuFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForMegaMenu(req),
    "statusUpdateForMegaMenuFn"
  );
};

/* mega menu attributes */

export const addMegaMenuAttributeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addMegaMenuAttribute(req), "addMegaMenuAttributeFn");
};

export const updateMegaMenuAttributeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateMegaMenuAttribute(req), "updateMegaMenuAttributeFn");
};

export const getMegaMenuAttributeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getMegaMenuAttribute(req), "getMegaMenuAttributeFn");
};

export const deleteMegaMenuAttributeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteMegaMenuAttribute(req), "deleteMegaMenuAttributeFn");
};

export const statusUpdateForMegaMenuAttributeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForMegaMenuAttribute(req),
    "statusUpdateForMegaMenuAttributeFn"
  );
};

export const getMegaMenuAttributeDetailFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getMegaMenuAttributeDetail(req),
    "getMegaMenuAttributeDetailFn"
  );
};

export const getMegaMenuForUserFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getMegaMenuForUser(req),
    "getMegaMenuForUserFn"
  );
};

export const updateSortOrderMegaMenuAttributeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateSortOrderMegaMenuAttribute(req),
    "updateSortOrderMegaMenuAttributeFn"
  );
};