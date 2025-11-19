import { Router } from "express";
import { activeInactiveSubscriptionValidator, addSubscriptionsValidator } from "../../../validators/enquirie/enquirie.validator";
import { addSubscriptionsFn, getAllSubscriptionListFn, subscriptionStatusUpdateFn } from "../../controllers/subscription.controller";
import { authorization } from "../../../middlewares/authenticate";

export default (app: Router) => {
    app.get("/subscription/list", [authorization],getAllSubscriptionListFn)
    app.put("/subscription/status", [authorization,activeInactiveSubscriptionValidator], subscriptionStatusUpdateFn)
}

