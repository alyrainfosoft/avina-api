import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addConfigProductOrder, addGiftSetProductOrder, addProductOrder, addProductWithPaypalOrder, configOrderDetailsAPI, deliveryStatusUpdate, getAllConfigOrdersUser, getAllGiftSetOrdersListAdmin, getAllGiftSetProductOrdersUser, getAllOrdersListAdmin, getAllOrdersUser, giftSetDeliveryStatusUpdate, giftSetOrderDetailsAPI, giftSetOrderDetailsAPIAdmin, giftSetOrderStatusUpdate, moveOrderToArchive, orderDetailsAPI, orderDetailsAPIAdmin, orderStatusUpdate, orderTransactionList } from "../services/orders.service";

export const addProductOrderFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addProductOrder(req), "addProductOrderFn");
}

export const getAllOrdersUserFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllOrdersUser(req), "getAllOrdersUserFn");
}

export const getAllOrdersListAdminFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllOrdersListAdmin(req), "getAllOrdersListAdminFn");
}

export const orderDetailsAPIFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, orderDetailsAPI(req), "orderDetailsAPIFn");
}

export const moveOrderToArchiveFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, moveOrderToArchive(req), "moveOrderToArchiveFn");
}

export const orderDetailsAPIAdminFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, orderDetailsAPIAdmin(req), "orderDetailsAPIAdminFn");
}

export const orderStatusUpdateFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, orderStatusUpdate(req), "orderStatusUpdateFn");
}

export const deliveryStatusUpdateFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, deliveryStatusUpdate(req), "deliveryStatusUpdateFn");
}

export const orderTransactionListFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, orderTransactionList(req), "orderTransactionListFn");
}

//////////-----   gift set order ------------////////////

export const addGiftSetProductOrderFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addGiftSetProductOrder(req), "addGiftSetProductOrderFn");
}

export const getAllGiftSetProductOrdersUserFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllGiftSetProductOrdersUser(req), "getAllGiftSetProductOrdersUserFn");
}

export const giftSetOrderDetailsAPIFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, giftSetOrderDetailsAPI(req), "giftSetOrderDetailsAPI");
}

export const giftSetOrderStatusUpdateFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, giftSetOrderStatusUpdate(req), "giftSetOrderStatusUpdateFn");
}

export const giftSetDeliveryStatusUpdateFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, giftSetDeliveryStatusUpdate(req), "giftSetDeliveryStatusUpdateFn");
}

export const getAllGiftSetOrdersListAdminFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllGiftSetOrdersListAdmin(req), "getAllGiftSetOrdersListAdminFn");
}

export const giftSetOrderDetailsAPIAdminFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, giftSetOrderDetailsAPIAdmin(req), "giftSetOrderDetailsAPIAdminFn");
}

///////////--------config product ----------------///////////

export const addConfigProductOrderFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addConfigProductOrder(req), "addConfigProductOrderFn");
}

export const getAllConfigOrdersUserFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getAllConfigOrdersUser(req), "getAllConfigOrdersUserFn");
}

export const configOrderDetailsAPIFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, configOrderDetailsAPI(req), "configOrderDetailsAPIFn");
}


/*----------- paypal payment method with order -----------------------*/

export const addProductWithPaypalOrderFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addProductWithPaypalOrder(req), "addProductWithPaypalOrderFn");
}
