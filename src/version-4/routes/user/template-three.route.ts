import { Router } from "express";
import {
  templateThreeAllSectionDetailForUserFn,
  templateThreeAllSectionListForUserFn
} from "../../controllers/template-three.controller";

export default (app: Router) => {
  /* user */

  app.get("/template-three", templateThreeAllSectionListForUserFn);
  app.get("/template-three/:id", templateThreeAllSectionDetailForUserFn);
};
