import { Router } from "express";
import {
  reqArrayImageParser,
  reqProductBulkUploadFileParser,
} from "../../middlewares/multipart-file-parser";
import {
  addLooseDiamondCSVFileFn,
  addLooseDiamondImagesFn,
  deleteLooseDiamondFn,
  getAllDiamondsFn,
  getLooseDiamondDetailAdminFn,
  getLooseDiamondsAdminFn,
} from "../controllers/loose-diamond.controller";
import { authorization } from "../../middlewares/authenticate";

export default (app: Router) => {
  app.post(
    "/loose-diamonds/csv",
    [authorization, reqProductBulkUploadFileParser("diamond_csv")],
    addLooseDiamondCSVFileFn
  );
  app.post(
    "/admin/loose-diamond-images",
    [reqArrayImageParser(["images"])],
    addLooseDiamondImagesFn
  );
  app.get("/admin/loose-diamond", [authorization], getLooseDiamondsAdminFn);
  app.get(
    "/admin/loose-diamond/:product_id",
    [authorization],
    getLooseDiamondDetailAdminFn
  );
  app.get("/loose-diamond", getLooseDiamondsAdminFn);
  app.get("/loose-diamond/:product_id", getLooseDiamondDetailAdminFn);
  app.delete("/loose-diamond/:product_id", deleteLooseDiamondFn);
  app.get("/diamonds", getAllDiamondsFn);
};
