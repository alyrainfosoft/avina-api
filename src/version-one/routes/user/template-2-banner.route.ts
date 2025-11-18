import { Router } from "express";
import { getAllTemplateTwoProductSectionUserFn } from "../../controllers/tempate-2-banner.controller";
import { currencyMiddleware } from "../../../middlewares/currency-rate-change";

export default (app: Router) => {

  app.get("/template/two/product-section",[currencyMiddleware], getAllTemplateTwoProductSectionUserFn);
  
};
