import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import { uploadImageFn } from "../../controllers/upload.controller";

export default (app: Router) => {
  app.post("/upload-image", [authorization], uploadImageFn);
};
