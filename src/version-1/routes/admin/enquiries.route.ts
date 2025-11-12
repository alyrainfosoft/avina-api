import { Router } from "express";
import { getAllProductEnquiriesFn, getGeneralEnquiriesFn, productEnquiriesDetailsFn, updateProductEnquiriesFn } from "../../controllers/enquirie.controller";
import { authorization } from "../../../middlewares/authenticate";

export default (app: Router) => {
    app.get("/enquiries/general", [authorization], getGeneralEnquiriesFn)

    app.get("/enquiries/product", [authorization], getAllProductEnquiriesFn)

    app.post("/enquiries/product/update", [authorization], updateProductEnquiriesFn)

    app.post("/enquiries/product/details", [authorization], productEnquiriesDetailsFn)

}