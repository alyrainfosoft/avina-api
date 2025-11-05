import { Router } from "express";
import {
  reqArrayImageParser,
  reqProductBulkUploadFileParser,
} from "../../../middlewares/multipart-file-parser";
import {
  addLooseDiamondCSVFileFn,
  addLooseDiamondFn,
  addLooseDiamondImagesFn,
  deleteLooseDiamondFn,
  getAllMasterDataForLooseDiamondFn,
  getLooseDiamondDetailAdminFn,
  getLooseDiamondsAdminFn,
  getLooseDiamondsFn,
  statusUpdateLooseDiamondFn,
  updateLooseDiamondFn,
} from "../../controllers/loose-diamond.controller";
import { authorization } from "../../../middlewares/authenticate";

export default (app: Router) => {
  app.post(
    "/loose-diamonds/csv",
    [authorization, reqProductBulkUploadFileParser("diamond_csv")],
    addLooseDiamondCSVFileFn
  );
  app.post(
    "/loose-diamond-images",
    [authorization,reqArrayImageParser(["images"])],
    addLooseDiamondImagesFn
  );
  app.get("/loose-diamonds", [authorization], getLooseDiamondsAdminFn);
  app.get(
    "/loose-diamond/:product_id",
    [authorization],
    getLooseDiamondDetailAdminFn
  );
  app.delete("/loose-diamond/:product_id",[authorization], deleteLooseDiamondFn);

  app.post("/loose-diamond-single",[authorization],addLooseDiamondFn);
  app.get("/loose-diamond-single/:id",[authorization],getLooseDiamondsAdminFn);
  app.put("/loose-diamond-single/:id",[authorization],updateLooseDiamondFn);
  app.patch("/loose-diamond-single/:id",[authorization],statusUpdateLooseDiamondFn);

  app.get("/loose-diamond",[authorization], getLooseDiamondsFn);

  app.get("/loose-diamond-master-drop-down",[authorization],getAllMasterDataForLooseDiamondFn);

};
