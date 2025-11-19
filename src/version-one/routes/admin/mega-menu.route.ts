import { Router } from "express";
import {
  addMegaMenuAttributeFn,
  addMegaMenuFn,
  deleteMegaMenuAttributeFn,
  deleteMegaMenuFn,
  getMegaMenuAttributeDetailFn,
  getMegaMenuAttributeFn,
  getMegaMenuFn,
  getMegaMenuForUserFn,
  statusUpdateForMegaMenuAttributeFn,
  statusUpdateForMegaMenuFn,
  updateMegaMenuAttributeFn,
  updateMegaMenuFn,
  updateSortOrderMegaMenuAttributeFn,
} from "../../controllers/mega-menu.controller";
import { reqSingleImageParser } from "../../../middlewares/multipart-file-parser";
import { authorization } from "../../../middlewares/authenticate";
import { addMegaMenuAttributeValidator, addMegaMenuValidator } from "../../../validators/mega-menu/mega-menu.validator";

export default (app: Router) => {

  app.post("/mega-menu", [authorization,addMegaMenuValidator], addMegaMenuFn);
  app.put("/mega-menu/:id", [authorization, addMegaMenuValidator], updateMegaMenuFn);
  app.get("/mega-menu",[authorization], getMegaMenuFn);
  app.patch("/mega-menu/:id",[authorization], statusUpdateForMegaMenuFn);
  app.delete("/mega-menu/:id",[authorization], deleteMegaMenuFn);

  /* mega menu attribute */
  app.post("/mega-menu-attribute", [authorization,reqSingleImageParser("image"),addMegaMenuAttributeValidator,], addMegaMenuAttributeFn);
  app.put("/mega-menu-attribute/:id", [authorization,reqSingleImageParser("image"),addMegaMenuAttributeValidator], updateMegaMenuAttributeFn);
  app.get("/mega-menu-attribute", [authorization], getMegaMenuAttributeFn);
  app.put("/mega-menu-attribute", [authorization], updateSortOrderMegaMenuAttributeFn);
  app.get("/mega-menu-attribute/:id_menu",[authorization], getMegaMenuAttributeDetailFn);
  app.patch("/mega-menu-attribute/:id",[authorization],  statusUpdateForMegaMenuAttributeFn);
  app.delete("/mega-menu-attribute/:id", [authorization], deleteMegaMenuAttributeFn);
  
};
