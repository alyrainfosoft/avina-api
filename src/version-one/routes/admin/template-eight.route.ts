import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import { reqMultiImageParser } from "../../../middlewares/multipart-file-parser";
import {
  upsertSectionFn,
  deleteSectionFn,
  activateInactiveSectionFn,
  getAllSectionsFn
} from "../../controllers/template-eight.controller";
// import { productSKUListFn } from "../../controllers/template-six.controller";

export default (app: Router) => {
  // Section CRUD
  app.post("/template-eight/section", [authorization, reqMultiImageParser(["title_image"])], upsertSectionFn);
  app.put("/template-eight/section/:id", [authorization, reqMultiImageParser(["title_image"])], upsertSectionFn);
  app.delete("/template-eight/section/:id", [authorization], deleteSectionFn);
  app.patch("/template-eight/section/:id", [authorization], activateInactiveSectionFn);

  // Get all sections (admin)
  app.get("/template-eight/section", [authorization], getAllSectionsFn);

  // app.get("/template-eight/product-sku", [authorization], productSKUListFn);

};