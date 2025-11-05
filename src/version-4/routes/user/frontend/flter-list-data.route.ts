import { Router } from "express";
import { categoryFilterListFn, configMasterDropDownFn, convertImageToWebpAPIFn, diamondFilterListAPIFn, metalFilterListAPIFn } from "../../../controllers/Frontend/filter-list-data.controller";
import { reqSingleImageParser } from "../../../../middlewares/multipart-file-parser";

export default (app: Router) => {

    app.get("/filter/list/diamond", diamondFilterListAPIFn);
    app.get("/filter/list/metal", metalFilterListAPIFn);
    app.get("/filter/list/category", categoryFilterListFn);
    // app.get("/config/master/drop-down", configMasterDropDownFn)

    // app.post("/convert/image/demo", reqSingleImageParser("image"), convertImageToWebpAPIFn )
}