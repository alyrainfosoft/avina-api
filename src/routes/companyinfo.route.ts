import { Router } from "express"
import { addCompanyInfoFn, getAllCompanyInfoFn, getCompnayInfoCustomerFn, updateCompanyInfoFn } from "../controllers/companyinfo.controller"
import { getAllCustomersFn } from "../controllers/customer.controller";
import { reqMultiImageParser, reqSingleImageParser } from "../middlewares/multipart-file-parser";
import { companyInfoValidator } from "../validators/companyinfo/comapnyinfo.validator"
import { authorization } from "../middlewares/authenticate";

export default (app: Router) => {
    app.post("/companyinfo/add", [authorization, companyInfoValidator], addCompanyInfoFn);
    app.put("/companyinfo/edit", [authorization, reqMultiImageParser(['dark_image', 'light_image'])], updateCompanyInfoFn);
    app.get("/companyinfo", [authorization], getAllCompanyInfoFn);
    app.get("/companyinfo/user", getCompnayInfoCustomerFn);
}