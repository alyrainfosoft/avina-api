import { Router } from "express";
import { currencyMiddleware } from "../../../middlewares/currency-rate-change";
import { PendantPriceFindFn, SlugPriceFindFn } from "../../controllers/config-pendant-product.controller";
import { pendantValidator, slugPendantValidator } from "../../../validators/pendant/pendant.validator";

export default (app: Router) => {
    app.post("/pendant-price", [pendantValidator, currencyMiddleware], PendantPriceFindFn);
    app.post("/pendant-price/:pendant_slug", [slugPendantValidator, currencyMiddleware], SlugPriceFindFn);
}