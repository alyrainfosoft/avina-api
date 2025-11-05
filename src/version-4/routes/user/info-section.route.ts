import { Router } from "express";
import {
  infoSectionListForUserFn,
} from "../../controllers/info-section.controller";

export default (app: Router) => {
  app.get("/info-section", infoSectionListForUserFn);
};
