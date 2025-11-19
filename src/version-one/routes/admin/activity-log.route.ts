import { Router } from "express";
import { getActivityLogsSectionFn } from "../../controllers/activity-log-controller";
import { authorization } from "../../../middlewares/authenticate";

export default (app: Router) => {
  app.get(
    "/activity-log",
    [authorization],
    getActivityLogsSectionFn
  );
}