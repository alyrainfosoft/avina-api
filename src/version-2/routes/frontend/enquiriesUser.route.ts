import { Router } from "express";
import { addEnquiriesFn, addProductEnquiriesFn } from "../../controllers/Frontend/enquiries.controller";
import { addEnquirieValidator, addProductEnquiriesValidator } from "../../../validators/enquirie/enquirie.validator";

export default (app: Router) => {

    app.post("/user/general/enquiries",[addEnquirieValidator], addEnquiriesFn);
    app.post("/user/product/enquiries",[addProductEnquiriesValidator], addProductEnquiriesFn);

}