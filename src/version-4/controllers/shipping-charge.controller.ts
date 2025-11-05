// ---------------------- start Sipping charge controller --------------------------//

import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  addSippingCharge,
  applySippingCharge,
  changeStatusShippingCharge,
  deleteShippingCharge,
  getShippingChargeByFilter,
  updatedShippingCharge,
} from "../services/shipping-charge.service";

export const addSippingChargeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addSippingCharge(req), "addSippingChargeFn");
};

export const getShippingChargeByFilterFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    getShippingChargeByFilter(req),
    "getShippingChargeByFilterFn"
  );
};

export const updatedShippingChargeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    updatedShippingCharge(req),
    "updatedShippingChargeFn"
  );
};

export const deleteShippingChargeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteShippingCharge(req),
    "deleteShippingChargeFn"
  );
};

export const changeStatusShippingChargeFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    changeStatusShippingCharge(req),
    "changeStatusShippingChargeFn"
  );
};

// ---------------------- end Sipping charge controller --------------------------//

//----------------------- start apply shipping charge controller-----------------------//

export const applyShippingChargeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, applySippingCharge(req), "applySippingChargeFn");
};

//----------------------- end apply shipping charge controller-----------------------//
