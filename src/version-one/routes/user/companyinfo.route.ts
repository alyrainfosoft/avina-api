import { Router } from "express";
import {
  getCompanyInfoCustomerFn,
  getCompanyInfoForAdminFn,
  updateWebRestrictURLFn,
} from "../../controllers/companyinfo.controller";

export default (app: Router) => {
  app.get("/companyinfo", getCompanyInfoCustomerFn);
  app.get("/companyinfo/admin", getCompanyInfoForAdminFn);

  // app.put("/web-restrict-url/:key", updateWebRestrictURLFn);
};
