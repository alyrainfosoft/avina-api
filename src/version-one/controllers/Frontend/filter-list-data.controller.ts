import { RequestHandler } from "express";
import { categoryFilterListApI, configMasterDropDown, diamondFilterListAPI, metalFilterListAPI } from "../../services/frontend/filter-list-data.service";
import { callServiceMethod } from "../base.controller";
import { convertImageToWebpAPI } from "../../services/master/attributes/product-Add.service";

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

export const convertImageToWebpAPIFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, convertImageToWebpAPI(req), "convertImageToWebpAPIFn");
}