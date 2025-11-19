import { Router } from "express";
import {
  addCompanyInfoFn,
  getAllCompanyInfoFn,
  getCompanyInfoCustomerFn,
  getCompanyInfoForAdminFn,
  updateCompanyInfoFn,
  updateWebRestrictURLFn,
} from "../../controllers/companyinfo.controller";
import { getAllCustomersFn } from "../../controllers/customer.controller";
import {
  reqMultiImageParser,
  reqSingleImageParser,
} from "../../../middlewares/multipart-file-parser";
import { companyInfoValidator } from "../../../validators/companyinfo/comapnyinfo.validator";
import { authorization } from "../../../middlewares/authenticate";

export default (app: Router) => {
  app.post(
    "/companyinfo/add",
    [authorization, companyInfoValidator],
    addCompanyInfoFn
  );
  app.put(
    "/companyinfo/edit",
    [
      authorization,
      reqMultiImageParser(["dark_image", "light_image", "favicon_image"]),
    ],
    updateCompanyInfoFn
  );
  app.get("/companyinfo", getCompanyInfoForAdminFn);
 
};
