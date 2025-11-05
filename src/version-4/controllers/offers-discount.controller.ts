import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addOffersAndDiscount, changeStatusOfferAndDiscount, deleteOfferAndDiscount, editOfferAndDiscount, generateCouponCode, getAllOfferAndDiscount } from "../services/offers-discount.service";

export const addOffersAndDiscountFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addOffersAndDiscount(req), "addOffersAndDiscountFn");
};

export const editOfferAndDiscountFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, editOfferAndDiscount(req), "editOfferAndDiscountFn");
};

export const getAllOfferAndDiscountFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllOfferAndDiscount(req), "getAllOfferAndDiscountFn");
};

export const changeStatusOfferAndDiscountFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, changeStatusOfferAndDiscount(req), "changeStatusOfferAndDiscountFn");
};

export const deleteOfferAndDiscountFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, deleteOfferAndDiscount(req), "addOffersAndDiscountFn");
};

export const generateCouponCodeFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, generateCouponCode(req), "generateCouponCodeFn");
};