import { Router } from "express";
import {
  getMetaDataListForUserFn,
} from "../../controllers/meta-data.controller";

export default (app: Router) => {
  app.get("/meta-data", getMetaDataListForUserFn);
};
