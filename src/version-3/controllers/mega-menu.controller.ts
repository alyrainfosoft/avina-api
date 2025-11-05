import { RequestHandler } from "express";
import {
  addMegaMenu,
  deleteMegaMenu,
  getMegaMenu,
  getMegaMenuListForUser,
  statusUpdateForMegaMenu,
  updateMegaMenu,
} from "../services/mega-menu.service";
import { callServiceMethod } from "./base.controller";

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

export const getMegaMenuListForUserFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getMegaMenuListForUser(req),
    "getMegaMenuListForUserFn"
  );
};
