import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addFAQCategory,
  addFAQQuestionAnswer,
  deleteFAQSection,
  getAllFAQCategory,
  getAllFAQQuestionAnswer,
  getAllFAQSectionForUser,
  getByIdFAQCategory,
  getByIdFAQQuestionAnswer,
  statusUpdateForFAQSection,
  updateFAQCategory,
  updateFAQQuestionAnswer,
} from "../services/faq-question-answer.service";

export const addFAQCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addFAQCategory(req), "addFAQCategoryFn");
};
export const getAllFAQCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllFAQCategory(req), "getAllFAQCategoryFn");
};
export const getByIdFAQCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdFAQCategory(req), "getByIdFAQCategoryFn");
};
export const updateFAQCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateFAQCategory(req), "updateFAQCategoryFn");
};
export const addFAQQuestionAnswerFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addFAQQuestionAnswer(req),
    "addFAQQuestionAnswerFn"
  );
};
export const getAllFAQQuestionAnswerFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getAllFAQQuestionAnswer(req),
    "getAllFAQQuestionAnswerFn"
  );
};
export const getByIdFAQQuestionAnswerFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getByIdFAQQuestionAnswer(req),
    "getByIdFAQQuestionAnswerFn"
  );
};
export const updateFAQQuestionAnswerFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updateFAQQuestionAnswer(req),
    "updateFAQQuestionAnswerFn"
  );
};
export const deleteFAQSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteFAQSection(req), "deleteFAQSectionFn");
};
export const statusUpdateForFAQSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForFAQSection(req),
    "statusUpdateForFAQSectionFn"
  );
};
export const getAllFAQSectionForUserFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getAllFAQSectionForUser(req),
    "getAllFAQSectionForUserFn"
  );
};
