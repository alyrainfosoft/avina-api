import { Router } from "express";
import { getPresignedUrlFn } from "../../controllers/masters/master.controller";
import { publicAuthentication } from "../../../middlewares/authenticate";

export default (app: Router) => {

      app.post("/presign", [publicAuthentication], getPresignedUrlFn);
      
  };