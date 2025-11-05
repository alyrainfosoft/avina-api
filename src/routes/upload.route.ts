import { Router } from "express";
import { uploadImageFn } from "../controllers/upload.controller";
import { authorization } from "../middlewares/authenticate";

export default (app: Router) => {
  app.post("/upload-image", [authorization], uploadImageFn);
};
