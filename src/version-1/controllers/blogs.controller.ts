import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addBlogs,
  bolgDetailAPI,
  defaultBlogs,
  deleteBlogs,
  getAllBlogsData,
  getBlogsDataUser,
  getByIdBlogsData,
  updateBlogs,
} from "../services/blogs.service";

export const addBlogsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addBlogs(req), "addBlogsFn");
};

export const getAllBlogsDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllBlogsData(req), "getAllBlogsDataFn");
};

export const updateBlogsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateBlogs(req), "updateBlogsFn");
};

export const deleteBlogsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteBlogs(req), "deleteBlogsFn");
};

export const getByIdBlogsDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdBlogsData(req), "getByIdBlogsDataFn");
};

export const getBlogsDataUserFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getBlogsDataUser(req), "getBlogsDataUserFn");
};

export const bolgDetailAPIFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, bolgDetailAPI(req), "bolgDetailAPIFn");
};

export const defaultBlogsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, defaultBlogs(req), "defaultBlogsFn");
};
