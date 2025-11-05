import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import {
  webhookForAffirm,
  webhookForPaypal,
  webhookForRazorpay,
  webhookForStripe,
} from "../services/webhook.service";

export const webhookForStripeFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, webhookForStripe(req), "webhookForStripeFn");
};

export const webhookForPaypalFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, webhookForPaypal(req), "webhookForPaypalFn");
};

export const webhookForAffirmFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, webhookForAffirm(req), "webhookForAffirmFn");
};

export const webhookForRazorPayFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, webhookForRazorpay(req), "webhookForRazorPayFn");
};
