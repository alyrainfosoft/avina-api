import { Router } from "express";
import { templateSevensAllSectionDetailForUserFn, templateSevensAllSectionListForUserFn } from "../../controllers/template-seven.controller";
import { currencyMiddleware } from "../../../middlewares/currency-rate-change";

export default (app: Router) => {

  // user side
  app.get("/template-seven",[currencyMiddleware],templateSevensAllSectionListForUserFn);
  app.get("/template-seven/:id",templateSevensAllSectionDetailForUserFn);
  //user side

}