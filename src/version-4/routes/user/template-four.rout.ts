import { Router } from "express";
import { templateSevensAllSectionDetailForUserFn, templateSevensAllSectionListForUserFn } from "../../controllers/template-seven.controller";
import { currencyMiddleware } from "../../../middlewares/currency-rate-change";
import { templateFoursAllSectionListForUserFn } from "../../controllers/ṭemplate-four-controller";

export default (app: Router) => {

  // user side
  app.get("/template-four",[currencyMiddleware],templateFoursAllSectionListForUserFn);
  //user side

}