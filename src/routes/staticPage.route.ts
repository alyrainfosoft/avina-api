import { Router } from "express";
import { addStaticPageFn, deleteStaticPageFn, getAllStaticPageFn, getByIdStaticPageFn, statusUpdateStaticPageFn, updateStaticPageFn } from "../controllers/masters/master.controller";
import { addMasterNameSlugValidator, updateMasterNameSlugValidator } from "../validators/master/master.validator";
import { authorization } from "../middlewares/authenticate";
import { getByslugStaticPageUserFn } from "../controllers/staticPage.controller";

export default (app: Router) => {

      app.post("/staticPage/add", [authorization, addMasterNameSlugValidator], addStaticPageFn);
      app.get("/staticPage", [authorization], getAllStaticPageFn);
      app.get("/staticPage/:id", [authorization], getByIdStaticPageFn);
      app.put("/staticPage/edit", [authorization, updateMasterNameSlugValidator], updateStaticPageFn);
      app.post("/staticPage/delete", [authorization], deleteStaticPageFn);
      app.put("/staticPage/status", [authorization], statusUpdateStaticPageFn);
      app.post("/staticPage/user", getByslugStaticPageUserFn);

  };