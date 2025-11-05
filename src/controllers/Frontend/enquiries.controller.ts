import { RequestHandler } from "express";
import { addEnquiries, addProductEnquiries } from "../../services/frontend/enquiries.service";
import { callServiceMethod } from "../base.controller";

export const addEnquiriesFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addEnquiries(req), "addEnquiriesFn");
}

export const addProductEnquiriesFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addProductEnquiries(req), "addProductEnquiriesFn");
}