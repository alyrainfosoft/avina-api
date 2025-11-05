import { Router } from "express";
import { getByslugStaticPageUserFn } from "../../controllers/staticPage.controller";

export default (app: Router) => {

  app.post("/staticPage", getByslugStaticPageUserFn);

  };