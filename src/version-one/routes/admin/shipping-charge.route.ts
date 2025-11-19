import { Router } from "express";
import {
  addSippingChargeFn,
  changeStatusShippingChargeFn,
  deleteShippingChargeFn,
  getShippingChargeByFilterFn,
  updatedShippingChargeFn,
} from "../../controllers/shipping-charge.controller";
import {
  addShippingChargeValidator,
  updateShippingChargeValidator,
} from "../../../validators/shipping-charge/shipping-charge.validator";
import { authorization } from "../../../middlewares/authenticate";

export default (app: Router) => {
  app.get("/shipping-charge",[authorization], getShippingChargeByFilterFn);
  app.get("/shipping-charge/:id",[authorization], getShippingChargeByFilterFn);
  app.post(
    "/shipping-charge",
    [authorization,addShippingChargeValidator],
    addSippingChargeFn
  );
  app.put(
    "/shipping-charge/:id",
    [authorization,updateShippingChargeValidator],
    updatedShippingChargeFn
  );
  app.patch("/shipping-charge/:id",[authorization], changeStatusShippingChargeFn);
  app.delete("/shipping-charge/:id",[authorization], deleteShippingChargeFn);

};
