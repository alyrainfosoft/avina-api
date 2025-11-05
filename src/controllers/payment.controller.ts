import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { PaymentTransaction, invoivesDetailsApi } from "../services/payment.service";

export const PaymentTransactionFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, PaymentTransaction(req), "PaymentTransactionFn");
}

export const invoivesDetailsApiFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, invoivesDetailsApi(req), "invoivesDetailsApiFn");
}