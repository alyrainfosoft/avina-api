import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addStudConfigProduct, AdminStudDetail, AdminStudList, DeleteStudProduct, PriceFindAdmin, SlugPriceFind, StudPriceFind } from "../services/stud-config-product.service";

export const bulkUploadStudConfig: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addStudConfigProduct(req), "bulkUploadStudConfig");
}

export const studPriceFindFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, StudPriceFind(req), "studPriceFindFn");
}

export const AdminStudListFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, AdminStudList(req), "AdminStudListFn");
}

export const AdminStudDetailFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, AdminStudDetail(req), "AdminStudDetailFn");
}

export const DeleteStudProductFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, DeleteStudProduct(req), "DeleteStudProductFn");
}

export const SlugPriceFindFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, SlugPriceFind(req), "SlugPriceFindFn");
}

export const AdminPriceFindFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, PriceFindAdmin(req), "AdminPriceFindFn");
}