import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addCoupon,
  applyCoupon,
  couponDetails,
  deleteCoupon,
  editCoupon,
  getCoupons,
  removeCoupon,
  statusUpdateForCoupon,
} from "../services/coupons.service";

export const addCouponFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addCoupon(req), "addCouponFn");
};
export const editCouponFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, editCoupon(req), "editCouponFn");
};
export const getCouponsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getCoupons(req), "getCouponsFn");
};
export const deleteCouponFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteCoupon(req), "deleteCouponFn");
};
export const statusUpdateForCouponFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForCoupon(req),
    "statusUpdateForCouponFn"
  );
};
export const applyCouponFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, applyCoupon(req), "applyCouponFn");
};

export const couponDetailsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, couponDetails(req), "couponDetailsFn");
};
export const removeCouponFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, removeCoupon(req), "removeCouponFn");
};
