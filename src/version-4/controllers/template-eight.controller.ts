import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  upsertSection,
  deleteSection,
  getAllSections,
  activateInactiveSection,
  getAllSectionsUser
} from "../services/template-eight/template-eight.service";

/* Section CRUD for Admin*/
export const upsertSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, upsertSection(req), "upsertSectionFn");
};

export const deleteSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteSection(req), "deleteSectionFn");
};

export const getAllSectionsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllSections(req), "getAllSectionsFn");
};

export const activateInactiveSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, activateInactiveSection(req), "activateInactiveSectionFn");
};

/* Section R for User */
export const getAllSectionsUserFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllSectionsUser(req), "getAllSectionsUserFn");
};