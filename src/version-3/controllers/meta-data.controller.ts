import { RequestHandler } from "express";
import {
  addMetaData,
  deleteMetaData,
  getByIdMetaData,
  getMetaData,
  getMetaDataListForUser,
  statusUpdateForMetaData,
  updateMetaData,
} from "../services/meta-data.service";
import { callServiceMethod } from "./base.controller";

export const addMetaDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addMetaData(req), "addMetaDataFn");
};
export const getMetaDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getMetaData(req), "getMetaDataFn");
};
export const getByIdMetaDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdMetaData(req), "getByIdMetaDataFn");
};
export const updateMetaDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, updateMetaData(req), "updateMetaDataFn");
};
export const deleteMetaDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteMetaData(req), "deleteMetaDataFn");
};
export const statusUpdateForMetaDataFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForMetaData(req),
    "statusUpdateForMetaDataFn"
  );
};

export const getMetaDataListForUserFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getMetaDataListForUser(req),
    "getMetaDataListForUserFn"
  );
};
