//////////////------ Tag --------///////////////

import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addBlogCategory,
  deleteBlogCategory,
  getBlogCategory,
  getByIdBlogCategory,
  statusUpdateForBlogCategory,
  updateBlogCategory,
} from "../services/blog-category.service";

export const getBlogCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getBlogCategory(req), "getBlogCategoryFn");
};

export const getByIdBlogCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getByIdBlogCategory(req),
    "getByIdBlogCategoryFn"
  );
};

export const addBlogCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addBlogCategory(req), "addBlogCategoryFn");
};

export const updateBlogCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateBlogCategory(req), "updateBlogCategoryFn");
};

export const deleteBlogCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteBlogCategory(req), "deleteBlogCategoryFn");
};

export const statusUpdateForBlogCategoryFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForBlogCategory(req),
    "statusUpdateForBlogCategoryFn"
  );
};
