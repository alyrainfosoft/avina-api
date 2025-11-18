import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import { AdminPriceFindFn, AdminStudDetailFn, AdminStudListFn, bulkUploadStudConfig, DeleteStudProductFn } from "../../controllers/stud-config-product.controller";
import { reqProductBulkUploadFileParser } from "../../../middlewares/multipart-file-parser";

export default (app: Router) => {
    app.post("/stud-config-product", [authorization, reqProductBulkUploadFileParser("config_csv")], bulkUploadStudConfig);
    app.get("/stud", [authorization], AdminStudListFn);
    app.get("/stud/:stud_id", [authorization], AdminStudDetailFn);
    app.delete("/stud/:stud_id", [authorization], DeleteStudProductFn);
    app.post("/stud-price/:stud_id", [authorization], AdminPriceFindFn);
}