import { Router } from "express";
import {
  getMegaMenuForUserFn,
} from "../../controllers/mega-menu.controller";

export default (app: Router) => {
  /* user side */

  app.get("/mega-menu", getMegaMenuForUserFn)
};
