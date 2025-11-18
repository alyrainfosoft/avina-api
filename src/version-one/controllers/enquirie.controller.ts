import { RequestHandler } from "express";
import { getAllGeneralEnquiries, getAllProductEnquiries, productEnquiriesDetails, updateProductEnquiries } from "../services/enquirie.service";
import { callServiceMethod } from "./base.controller";

export const getGeneralEnquiriesFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllGeneralEnquiries(req), "getGeneralEnquiriesFn");
}

export const getAllProductEnquiriesFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllProductEnquiries(req), "getAllProductEnquiriesFn");
}

export const updateProductEnquiriesFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, updateProductEnquiries(req), "updateProductEnquiriesFn");
}

export const productEnquiriesDetailsFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, productEnquiriesDetails(req), "productEnquiriesDetailsFn");
}