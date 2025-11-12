import { Router } from "express"
import { PaymentTransactionFn, PaymentTransactionWithPaypalFn, configProductPaymentTransactionFn, giftProductPaymentTransactionFn, giftsetInvoivesDetailsApiFn, invoivesDetailsApiFn } from "../../controllers/payment.controller"
import { authorization, customerAuthorization } from "../../../middlewares/authenticate"

export default (app: Router) => {

    app.post("/paymet/add",  PaymentTransactionFn)

    app.post("/payment/gift-set/add", giftProductPaymentTransactionFn)

    // app.post("/config/product/paymet/add",  configProductPaymentTransactionFn)

    /* paypal method */

    app.post("/paymet/paypal/add",  PaymentTransactionWithPaypalFn)

}