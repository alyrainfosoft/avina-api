import { RequestHandler } from "express";
import { addOrEditMailTemplate, deleteMailTemplate, getMailTemplate, statusUpdateForMailTemplate } from "../services/mail-template.service";
import { callServiceMethod } from "./base.controller";

/*add Or Edit MailTemplate */
export const addOrEditMailTemplateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addOrEditMailTemplate(req), "addOrEditMailTemplateFn");
};

export const getMailTemplateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getMailTemplate(req), "getMailTemplateFn");
};

export const deleteMailTemplateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteMailTemplate(req), "deleteMailTemplateFn");
};

export const statusUpdateForMailTemplateFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    statusUpdateForMailTemplate(req),
    "statusUpdateForMailTemplateFn"
  );
};