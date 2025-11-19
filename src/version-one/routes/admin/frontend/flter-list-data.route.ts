import { Router } from "express";
import { categoryFilterListFn, configMasterDropDownFn, convertImageToWebpAPIFn, diamondFilterListAPIFn, metalFilterListAPIFn } from "../../../controllers/Frontend/filter-list-data.controller";
import { reqSingleImageParser } from "../../../../middlewares/multipart-file-parser";
import { authorization } from "../../../../middlewares/authenticate";

export default (app: Router) => {

    app.get("/filter/list/metal",[authorization], metalFilterListAPIFn);
    app.get("/config/master/drop-down",[authorization], configMasterDropDownFn)
    app.get("/filter/list/category", categoryFilterListFn);

}