import { Router } from "express";
import {
  addMegaMenuFn,
  deleteMegaMenuFn,
  getMegaMenuFn,
  getMegaMenuListForUserFn,
  statusUpdateForMegaMenuFn,
  updateMegaMenuFn,
} from "../controllers/mega-menu.controller";
import { reqSingleImageParser } from "../../middlewares/multipart-file-parser";

export default (app: Router) => {
  app.post("/mega-menu", [reqSingleImageParser("image")], addMegaMenuFn);
  app.put("/mega-menu/:id", [reqSingleImageParser("image")], updateMegaMenuFn);
  app.get("/mega-menu", getMegaMenuFn);
  app.patch("/mega-menu/:id", statusUpdateForMegaMenuFn);
  app.delete("/mega-menu/:id", deleteMegaMenuFn);
  app.get("/mega-menu/user", getMegaMenuListForUserFn);
};
