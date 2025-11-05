import { Router } from "express";
import {
  addSippingChargeFn,
  applyShippingChargeFn,
  changeStatusShippingChargeFn,
  deleteShippingChargeFn,
  getShippingChargeByFilterFn,
  updatedShippingChargeFn,
} from "../controllers/shipping-charge.controller";
import {
  addShippingChargeValidator,
  applyShippingChargeValidator,
  updateShippingChargeValidator,
} from "../../validators/shipping-charge/shipping-charge.validator";

export default (app: Router) => {
  app.get("/shipping-charge", getShippingChargeByFilterFn);
  app.get("/shipping-charge/:id", getShippingChargeByFilterFn);
  app.post(
    "/shipping-charge",
    [addShippingChargeValidator],
    addSippingChargeFn
  );
  app.put(
    "/shipping-charge/:id",
    [updateShippingChargeValidator],
    updatedShippingChargeFn
  );
  app.patch("/shipping-charge/:id", changeStatusShippingChargeFn);
  app.delete("/shipping-charge/:id", deleteShippingChargeFn);

  app.post(
    "/apply-shipping-charge",
    [applyShippingChargeValidator],
    applyShippingChargeFn
  );
};
