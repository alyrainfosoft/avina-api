import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addFilters, editFilters, filterMasterList, getAllFilters, getFilterForUser, statusUpdateForFilter } from "../services/filters.service";

export const addFiltersFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addFilters(req), "addFiltersFn");
}

export const editFiltersFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, editFilters(req), "editFiltersFn");
}

export const getAllFiltersFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllFilters(req), "getAllFiltersFn");
}

export const statusUpdateForFilterFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, statusUpdateForFilter(req), "statusUpdateForFilterFn");
}

export const getFilterForUserFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getFilterForUser(req), "getFilterForUserFn");
}

export const filterMasterListFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, filterMasterList(req), "filterMasterListFn");
}