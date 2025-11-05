import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { getActivityLogsSection } from "../services/activity-log.service";

export const getActivityLogsSectionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getActivityLogsSection(req), "getActivityLogsSectionFn");
};