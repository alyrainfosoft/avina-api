import { Router } from "express";
import { categoryFilterListFn, configMasterDropDownFn, diamondFilterListAPIFn, metalFilterListAPIFn } from "../../controllers/Frontend/filter-list-data.controller";

export default (app: Router) => {

    app.get("/filter/list/diamond", diamondFilterListAPIFn);
    app.get("/filter/list/metal", metalFilterListAPIFn);
    app.get("/filter/list/category", categoryFilterListFn);
    app.get("/config/master/drop-down", configMasterDropDownFn)
}