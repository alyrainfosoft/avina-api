import { Router } from "express";
import {  addSubscriptionsValidator } from "../../../validators/enquirie/enquirie.validator";
import { addSubscriptionsFn } from "../../controllers/subscription.controller";

export default (app: Router) => {
    app.post("/subscription/add", [addSubscriptionsValidator], addSubscriptionsFn)
}

