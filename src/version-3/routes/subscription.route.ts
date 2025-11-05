import { Router } from "express";
import { activeInactiveSubscriptionValidator, addSubscriptionsValidator } from "../../validators/enquirie/enquirie.validator";
import { addSubscriptionsFn, getAllSubscriptionListFn, subscriptionStatusUpdateFn } from "../controllers/subscription.controller";

export default (app: Router) => {
    app.post("/user/subscription/add", [addSubscriptionsValidator], addSubscriptionsFn)
    app.get("/admin/subscription/list", getAllSubscriptionListFn)
    app.put("/admin/subsction/satus", [activeInactiveSubscriptionValidator], subscriptionStatusUpdateFn)
}

