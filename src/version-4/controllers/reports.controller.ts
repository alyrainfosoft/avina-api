import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { cartProductReports, customerReports, customerSubscriberReports, topSellingProductReports, wishlistProductReports } from "../services/reports.service";

export const customerReportsFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, customerReports(req), "customerReportsFn");
};

export const customerSubscriberReportsFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, customerSubscriberReports(req), "customerSubscriberReportsFn");
};

export const wishlistProductReportsFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, wishlistProductReports(req), "wishlistProductReportsFn");
};

export const cartProductReportsFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, cartProductReports(req), "cartProductReportsFn");
};

export const topSellingProductReportsFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, topSellingProductReports(req), "topSellingProductReportsFn");
};