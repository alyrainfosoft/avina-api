import { Router } from "express";
import { SlugPriceFindFn, studPriceFindFn } from "../../controllers/stud-config-product.controller";
import { slugStudValidator, studValidator } from "../../../validators/stud/stud.validator";
import { currencyMiddleware } from "../../../middlewares/currency-rate-change";

export default (app: Router) => {
    app.post("/stud-price", [studValidator, currencyMiddleware], studPriceFindFn);
    app.post("/stud-price/:stud_slug", [slugStudValidator, currencyMiddleware], SlugPriceFindFn);
}