import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { PaymentTransaction, PaymentTransactionWithPaypal, configProductPaymentTransaction, giftProductPaymentTransaction, giftsetInvoivesDetailsApi, invoivesDetailsApi } from "../services/payment.service";

export const PaymentTransactionFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, PaymentTransaction(req), "PaymentTransactionFn");
}

export const invoivesDetailsApiFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, invoivesDetailsApi(req), "invoivesDetailsApiFn");
}

export const giftProductPaymentTransactionFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, giftProductPaymentTransaction(req), "giftProductPaymentTransactionFn");
}

export const giftsetInvoivesDetailsApiFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, giftsetInvoivesDetailsApi(req), "giftsetInvoivesDetailsApiFn");
}

/////----- config product transaction------------////////////////

export const configProductPaymentTransactionFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, configProductPaymentTransaction(req), "configProductPaymentTransactionFn");
}

//////////--------- paypal with tranction API ------------//////////


export const PaymentTransactionWithPaypalFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, PaymentTransactionWithPaypal(req), "PaymentTransactionWithPaypalFn");
}