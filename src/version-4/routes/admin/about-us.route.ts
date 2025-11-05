import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import { reqArrayImageParser } from "../../../middlewares/multipart-file-parser";
import { addAboutUsSectionFn, deleteAboutUsSectionFn, getAboutUsSectionFn, statusUpdateForAboutUsSectionFn, updateAboutUsSectionFn } from "../../controllers/about-us.controller";

export default (app: Router) => {
    app.post(
        "/about-us",
        [authorization, reqArrayImageParser(["image"])],
        addAboutUsSectionFn
      );
      app.get("/about-us", [authorization], getAboutUsSectionFn);
      app.put(
        "/about-us/:id",
        [authorization, reqArrayImageParser(["image"])],
        updateAboutUsSectionFn
      );
      app.delete(
        "/about-us/:id",
        [authorization],
        deleteAboutUsSectionFn
      );
      app.patch(
        "/about-us/:id",
        [authorization],
        statusUpdateForAboutUsSectionFn
      );

}