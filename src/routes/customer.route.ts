import { Router } from "express";
import { addCustomersFn, deleteCustomersFn, getAllCustomersFn, getByIdCustomersFn, statusUpdateCustomersFn, updateCustomersFn } from "../controllers/customer.controller";
import { reqSingleImageParser } from "../middlewares/multipart-file-parser";
import { statusUpdateMasterValidator } from "../validators/master/master.validator";
import { authorization } from "../middlewares/authenticate";

export default (app: Router) => {
    
    app.post("/customer/add", [authorization, reqSingleImageParser("image")] , addCustomersFn);
    app.get("/customer", [authorization], getAllCustomersFn);
    app.get("/customer/:id", [authorization], getByIdCustomersFn);
    app.put("/customer/edit", [authorization, reqSingleImageParser("image")], updateCustomersFn);
    app.post("/customer/delete", [authorization], deleteCustomersFn);
    app.put("/customer/status", [authorization, statusUpdateMasterValidator], statusUpdateCustomersFn);
  };