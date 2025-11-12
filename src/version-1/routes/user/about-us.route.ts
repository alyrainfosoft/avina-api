import { Router } from "express";
import { aboutUsSectionDetailForUserFn, aboutUsSectionListForUserFn } from "../../controllers/about-us.controller";

export default (app: Router) => {

  app.get("/about-us", aboutUsSectionListForUserFn)
  // app.get("/about-us/:id", aboutUsSectionDetailForUserFn)

}