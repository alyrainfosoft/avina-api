import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import { getByIdMailLogsFn, getMailLogFn } from "../../controllers/mail-log-controller";

export default (app: Router) => {
  app.get(
      "/email-log",
      [authorization],
      getMailLogFn
    );

  app.get(
      "/email-log/:id",
      [authorization],
      getByIdMailLogsFn
    ); 
}