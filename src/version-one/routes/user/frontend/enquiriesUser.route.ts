import { Router } from "express";
import { addEnquirieValidator, addProductEnquiriesValidator } from "../../../../validators/enquirie/enquirie.validator";
import { addEnquiriesFn, addProductEnquiriesFn } from "../../../controllers/Frontend/enquiries.controller";

export default (app: Router) => {

    app.post("/general/enquiries",[addEnquirieValidator], addEnquiriesFn);
    app.post("/product/enquiries",[addProductEnquiriesValidator], addProductEnquiriesFn);

}