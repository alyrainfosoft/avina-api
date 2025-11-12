import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { AddPendantConfigProduct, AdminPendantDetail, AdminPendantList, DeletePendantProduct, PendantPriceFind, PriceFindAdmin, SlugPriceFind } from "../services/pendant-config-product.service";

export const BulkUploadPendantConfig: RequestHandler = (req, res) => {
    callServiceMethod(req, res, AddPendantConfigProduct(req), "bulkUploadPendantConfig");
}

export const PendantPriceFindFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, PendantPriceFind(req), "pendantPriceFindFn");
}

export const AdminPendantListFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, AdminPendantList(req), "AdminPendantListFn");
}

export const AdminPendantDetailFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, AdminPendantDetail(req), "AdminPendantDetailFn");
}

export const DeletePendantProductFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, DeletePendantProduct(req), "DeletePendantProductFn");
}

export const SlugPriceFindFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, SlugPriceFind(req), "SlugPriceFindFn");
}

export const AdminPriceFindFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, PriceFindAdmin(req), "AdminPriceFindFn");
}