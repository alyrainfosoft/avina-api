import { Router } from "express"
import { PaymentTransactionFn, PaymentTransactionWithPaypalFn, configProductPaymentTransactionFn, giftProductPaymentTransactionFn, giftsetInvoivesDetailsApiFn, invoivesDetailsApiFn } from "../../controllers/payment.controller"
import { authorization, customerAuthorization } from "../../../middlewares/authenticate"

export default (app: Router) => {

    app.post("/invoice/details", [authorization], invoivesDetailsApiFn)

    app.post("/invoice/gift-set/details", [authorization], giftsetInvoivesDetailsApiFn)

}