import { Router } from "express";
import {
  applyShippingChargeFn,
  getShippingChargeByFilterFn,
} from "../../controllers/shipping-charge.controller";
import {
  applyShippingChargeValidator,
} from "../../../validators/shipping-charge/shipping-charge.validator";

export default (app: Router) => {
  app.get("/shipping-charge", getShippingChargeByFilterFn);
  app.get("/shipping-charge/:id", getShippingChargeByFilterFn);
  // app.post(
  //   "/apply-shipping-charge",
  //   [applyShippingChargeValidator],
  //   applyShippingChargeFn
  // );
};
