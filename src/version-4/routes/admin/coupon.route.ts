import { Router } from "express";
import {
  addCouponFn,
  applyCouponFn,
  couponDetailsFn,
  deleteCouponFn,
  editCouponFn,
  getCouponsFn,
  removeCouponFn,
  statusUpdateForCouponFn,
} from "../../controllers/coupon.controller";
import { authorization } from "../../../middlewares/authenticate";
import {
  addCouponValidation,
  updateCouponValidation,
} from "../../../validators/coupon/coupon.validator";

export default (app: Router) => {
  app.get("/coupon", [authorization], getCouponsFn);
  app.post("/coupon", [authorization, addCouponValidation], addCouponFn);
  app.get("/coupon/:id", [authorization], couponDetailsFn);
  app.put("/coupon/:id", [authorization, updateCouponValidation], editCouponFn);
  app.patch("/coupon/:id", [authorization], statusUpdateForCouponFn);
  app.delete("/coupon/:id", [authorization], deleteCouponFn);

};
