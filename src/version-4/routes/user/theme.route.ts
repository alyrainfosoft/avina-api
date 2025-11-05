import { Router } from "express";
import { getThemeDataForUserFn } from "../../controllers/themes.controller";
import { decryptCompanyInfoKeyForParams } from "../../../middlewares/req-res-encoder";

export default (app: Router) => {
    app.get("/theme/:company_key",[decryptCompanyInfoKeyForParams], getThemeDataForUserFn)
}