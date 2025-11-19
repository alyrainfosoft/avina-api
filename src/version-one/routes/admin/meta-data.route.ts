import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import {
  addMetaDataFn,
  deleteMetaDataFn,
  getByIdMetaDataFn,
  getMetaDataFn,
  getMetaDataListForUserFn,
  statusUpdateForMetaDataFn,
  updateMetaDataFn,
} from "../../controllers/meta-data.controller";

export default (app: Router) => {
  app.post("/meta-data", [authorization], addMetaDataFn);
  app.get("/meta-data", [authorization], getMetaDataFn);
  app.get("/meta-data/:id", [authorization], getByIdMetaDataFn);
  app.put("/meta-data/:id", [authorization], updateMetaDataFn);
  app.delete("/meta-data/:id", [authorization], deleteMetaDataFn);
  app.patch("/meta-data/:id", [authorization], statusUpdateForMetaDataFn);
};
