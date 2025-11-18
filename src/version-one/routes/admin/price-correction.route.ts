import { Router } from "express";
import { addOrUpdatePriceCorrectionFn, getPriceCorrectionFn } from "../../controllers/price-correction.controller";
import { authorization } from "../../../middlewares/authenticate";
import { priceCorrectionValidator } from "../../../validators/price-correction/price-correction.validator";

export default (app: Router) => {
    app.get("/price-correction",[authorization], getPriceCorrectionFn)
    app.put("/price-correction",[authorization, priceCorrectionValidator], addOrUpdatePriceCorrectionFn)

};