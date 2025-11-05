import { RequestHandler } from "express";
import { categoryFilterListApI, configMasterDropDown, diamondFilterListAPI, metalFilterListAPI } from "../../services/frontend/filter-list-data.service";
import { callServiceMethod } from "../base.controller";

export const diamondFilterListAPIFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, diamondFilterListAPI(req), "diamondFilterListAPIFn");
}

export const metalFilterListAPIFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, metalFilterListAPI(req), "metalFilterListAPIFn");
}

export const categoryFilterListFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, categoryFilterListApI(req), "categoryFilterListFn");
}

export const configMasterDropDownFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, configMasterDropDown(req), "configMasterDropDown");
}