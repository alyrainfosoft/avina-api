import { RequestHandler } from "express";
import { addCategory, deleteCategory, getAllCategory, getAllMainCategory, getAllSubCategory, searchablesCategory, statusUpdateCategory, updateCategory } from "../services/category.service";
import { getAllCountry } from "../services/master/contry.service";
import { callServiceMethod } from "./base.controller";

export const addCategoryFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addCategory(req), "addCategoryFn");
  };

export const getAllCategoryFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllCategory(req), "getAllCurrencyFn");
}

export const getAllMainCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllMainCategory(req), "getAllMainCategoryFn");
}

export const getAllSubCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllSubCategory(req), "getAllSubCategoryFn");
}

export const updateCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateCategory(req), "updateCategoryFn");
}

export const deleteCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteCategory(req), "deleteCategoryFn");
}

export const statusUpdateCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, statusUpdateCategory(req), "statusUpdateCategoryFn");
}

export const searchableCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, searchablesCategory(req), "statusUpdateCategoryFn");
}
