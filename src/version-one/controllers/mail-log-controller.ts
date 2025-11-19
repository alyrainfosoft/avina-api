import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { getByIdMailLogs, getMailLog } from "../services/mail-logs.service";

export const getMailLogFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getMailLog(req), "getMailLogFn");
};

export const getByIdMailLogsFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getByIdMailLogs(req), "getByIdMailLogsFn");
};