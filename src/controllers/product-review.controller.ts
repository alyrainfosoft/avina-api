import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addProductReview, getProductReviewByProductID, getProductReviewListData, statusUpdateforProductReview } from "../services/product-review.service";

export const addProductReviewFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addProductReview(req), "addProductReviewFn");
}

export const getProductReviewByProductIDFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getProductReviewByProductID(req), "getProductReviewByProductIDFn");
}

export const getProductReviewListDataFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getProductReviewListData(req), "getProductReviewListDataFn");
}

export const statusUpdateforProductReviewFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, statusUpdateforProductReview(req), "statusUpdateforProductReviewFn");
}