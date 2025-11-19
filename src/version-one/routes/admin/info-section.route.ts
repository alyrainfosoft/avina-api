import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import {
  addUpdateInfoSectionFn,
  getInfoSectionFn,
  infoSectionListForUserFn,
} from "../../controllers/info-section.controller";

export default (app: Router) => {
  app.post("/info-section", [authorization], addUpdateInfoSectionFn);
  app.get("/info-section/:info_key", [authorization], getInfoSectionFn);
  app.get("/info-section", [authorization], getInfoSectionFn);
  app.get("/user/info-section", infoSectionListForUserFn);
};
