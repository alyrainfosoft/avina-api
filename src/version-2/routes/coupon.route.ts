import { Router } from "express";
import {
  addCouponFn,
  applyCouponFn,
  couponDetailsFn,
  deleteCouponFn,
  editCouponFn,
  getCouponsFn,
  statusUpdateForCouponFn,
} from "../controllers/coupon.controller";
import { authorization } from "../../middlewares/authenticate";
import { addCouponValidation } from "../../validators/coupon/coupon.validator";

export default (app: Router) => {
  app.get("/coupon", [authorization], getCouponsFn);
  app.post("/coupon", [authorization, addCouponValidation], addCouponFn);
  app.get("/coupon/:id", [authorization], couponDetailsFn);
  app.put("/coupon/:id", [authorization, addCouponValidation], editCouponFn);
  app.patch("/coupon/:id", [authorization], statusUpdateForCouponFn);
  app.delete("/coupon/:id", [authorization], deleteCouponFn);
  app.post("/user/coupon", applyCouponFn);
};
