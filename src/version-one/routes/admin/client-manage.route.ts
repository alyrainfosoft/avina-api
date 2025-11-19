import { Router } from "express";
import { addClientFn, editClientFn, getAllClientsFn, getClientDetailFn, statusUpdateForClientFn } from "../../controllers/client-manage.controller";
import { authorization } from "../../../middlewares/authenticate";
import { addClientValidator, updateClientValidator } from "../../../validators/theme/theme.validator";
import { decryptCompanyInfoKeyForParams } from "../../../middlewares/req-res-encoder";


export default (app: Router) => {
    app.get("/client-manage",[authorization], getAllClientsFn);
    app.post("/client-manage",[authorization, addClientValidator], addClientFn);
    app.put("/client-manage/:company_key",[decryptCompanyInfoKeyForParams,authorization, updateClientValidator], editClientFn);
    app.get("/client-manage/:company_key",[decryptCompanyInfoKeyForParams,authorization], getClientDetailFn);
    app.patch("/client-manage/:company_key",[decryptCompanyInfoKeyForParams,authorization], statusUpdateForClientFn);
}