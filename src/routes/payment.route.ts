import { Router } from "express"
import { PaymentTransactionFn, invoivesDetailsApiFn } from "../controllers/payment.controller"
import { authorization, customerAuthorization } from "../middlewares/authenticate"

export default (app: Router) => {

    app.post("/paymet/add",  PaymentTransactionFn)
    app.post("/invoice/details", [authorization], invoivesDetailsApiFn)

}