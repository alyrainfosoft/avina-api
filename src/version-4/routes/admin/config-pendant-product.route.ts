import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import { reqProductBulkUploadFileParser } from "../../../middlewares/multipart-file-parser";
import { AdminPendantDetailFn, AdminPendantListFn, AdminPriceFindFn, BulkUploadPendantConfig, DeletePendantProductFn } from "../../controllers/config-pendant-product.controller";
import { currencyMiddleware } from "../../../middlewares/currency-rate-change";

export default (app: Router) => {
    app.post("/pendant-config-product", [authorization, reqProductBulkUploadFileParser("config_csv")], BulkUploadPendantConfig);
    app.get("/pendant", [authorization], AdminPendantListFn);
    app.get("/pendant/:pendant_id", [authorization], AdminPendantDetailFn);
    app.delete("/pendant/:pendant_id", [authorization], DeletePendantProductFn);
    app.post("/pendant-price/:pendant_id", [authorization], AdminPriceFindFn);
}