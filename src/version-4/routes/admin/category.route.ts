import { Router } from "express";
import { addCategoryFn, deleteCategoryFn, getAllCategoryFn, getAllMainCategoryFn, getAllSubCategoryFn, searchableCategoryFn, statusUpdateCategoryFn, updateCategoryFn } from "../../controllers/category.controller";
import { reqSingleImageParser } from "../../../middlewares/multipart-file-parser";
import { addMasterNameSlugValidator, statusUpdateMasterValidator, updateMasterNameSlugValidator } from "../../../validators/master/master.validator";
import { authorization } from "../../../middlewares/authenticate";
import { addProductDropdownFn } from "../../controllers/masters/master.controller";

export default (app: Router) => {
    
    app.post("/category/add", [authorization, reqSingleImageParser("image") ,addMasterNameSlugValidator], addCategoryFn);
    app.get("/category", [authorization], getAllCategoryFn);
    app.get("/category/main", [authorization], getAllMainCategoryFn);
    app.post("/category/sub", [authorization], getAllSubCategoryFn);
    app.put("/category/edit", [authorization, reqSingleImageParser("image") ,updateMasterNameSlugValidator], updateCategoryFn);
    app.post("/category/delete", [authorization], deleteCategoryFn);
    app.put("/category/status", [authorization, statusUpdateMasterValidator], statusUpdateCategoryFn);
    app.put("/category/searchable", [authorization], searchableCategoryFn);

    app.get("/category/add-product/dropDown/list",[authorization], addProductDropdownFn);
    
  };