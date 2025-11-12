import { Router } from "express";
import {
  reqArrayImageParser,
  reqProductBulkUploadFileParser,
} from "../../../middlewares/multipart-file-parser";
import {

  getAllDiamondsFn,
  getAllMasterDataForLooseDiamondFn,
  getLooseDiamondDetailFn,
  getLooseDiamondsFn,

} from "../../controllers/loose-diamond.controller";

export default (app: Router) => {
  
  app.get("/loose-diamond", getLooseDiamondsFn);
  app.get("/loose-diamond/:product_id", getLooseDiamondDetailFn);
  app.get("/diamonds", getAllDiamondsFn);

};
