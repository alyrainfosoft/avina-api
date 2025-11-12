import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import { cartProductReportsFn, customerReportsFn, customerSubscriberReportsFn, topSellingProductReportsFn, wishlistProductReportsFn } from "../../controllers/reports.controller";

export default (app: Router) => {
    app.get("/report/customers", [authorization], customerReportsFn)
    app.get("/report/customer-Subscriberes", [authorization], customerSubscriberReportsFn)
    app.get("/report/wishlist-product", [authorization], wishlistProductReportsFn)
    app.get("/report/cart-product", [authorization], cartProductReportsFn)
    app.get("/report/top-selling-product", [authorization], topSellingProductReportsFn)

};