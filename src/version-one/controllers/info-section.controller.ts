import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addUpdateInfoSection,
  getInfoSection,
  infoSectionListForUser,
} from "../services/info-section.service";

export const addUpdateInfoSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addUpdateInfoSection(req),
    "addUpdateInfoSectionFn"
  );
};

export const getInfoSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getInfoSection(req), "getInfoSectionFn");
};
export const infoSectionListForUserFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    infoSectionListForUser(req),
    "infoSectionListForUserFn"
  );
};
