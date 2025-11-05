import { Router } from "express";
import {
  applyCouponFn,
  removeCouponFn,
} from "../../controllers/coupon.controller";

export default (app: Router) => {
  app.post("/coupon", applyCouponFn);
  app.delete("/coupon", removeCouponFn);
};
