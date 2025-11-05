import { Router } from "express";
import {
  webhookForAffirmFn,
  webhookForPaypalFn,
  webhookForRazorPayFn,
  webhookForStripeFn,
} from "../controllers/webhook.controller";

export default () => {
  const app = Router();
  app.post("/stripe", webhookForStripeFn);
  app.post("/paypal", webhookForPaypalFn);
  app.post("/affirm", webhookForAffirmFn);
  app.post("/razorpay", webhookForRazorPayFn);

  return app;
};
