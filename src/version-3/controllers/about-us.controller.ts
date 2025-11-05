import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { aboutUsSectionDetailForUser, aboutUsSectionListForUser, addAboutUsSection, deleteAboutUsSection, getAboutUsSection, statusUpdateForAboutUsSection, updateAboutUsSection } from "../services/about-us.service";

export const addAboutUsSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addAboutUsSection(req), "addAboutUsSectionFn");
};

export const updateAboutUsSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateAboutUsSection(req),
    "updateAboutUsSectionFn"
  );
};

export const getAboutUsSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAboutUsSection(req), "getAboutUsSectionFn");
};

export const deleteAboutUsSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteAboutUsSection(req),
    "deleteAboutUsSectionFn"
  );
};

export const statusUpdateForAboutUsSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForAboutUsSection(req),
    "statusUpdateForAboutUsSectionFn"
  );
};

export const aboutUsSectionListForUserFn: RequestHandler = (req, res) => {
    callServiceMethod(
      req,
      res,
      aboutUsSectionListForUser(req),
      "aboutUsSectionListForUserFn"
    );
  };

  export const aboutUsSectionDetailForUserFn: RequestHandler = (req, res) => {
    callServiceMethod(
      req,
      res,
      aboutUsSectionDetailForUser(req),
      "aboutUsSectionDetailForUserFn"
    );
  };