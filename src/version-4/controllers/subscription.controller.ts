import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addSubscriptions, getAllSubscriptionList, subscriptionStatusUpdate } from "../services/subscription.service";

export const addSubscriptionsFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addSubscriptions(req), "addSubscriptionsFn");
}

export const getAllSubscriptionListFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllSubscriptionList(req), "getAllSubscriptionListFn");
}

export const subscriptionStatusUpdateFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, subscriptionStatusUpdate(req), "subscriptionStatusUpdateFn");
}