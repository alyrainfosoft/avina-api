import { Router } from "express";
import { addConfigProductOrderFn, addGiftSetProductOrderFn, addProductOrderFn, addProductWithPaypalOrderFn, configOrderDetailsAPIFn, deliveryStatusUpdateFn, getAllConfigOrdersUserFn, getAllGiftSetOrdersListAdminFn, getAllGiftSetProductOrdersUserFn, getAllOrdersListAdminFn, getAllOrdersUserFn, giftSetDeliveryStatusUpdateFn, giftSetOrderDetailsAPIAdminFn, giftSetOrderDetailsAPIFn, giftSetOrderStatusUpdateFn, orderDetailsAPIAdminFn, orderDetailsAPIFn, orderStatusUpdateFn, orderTransactionListFn } from "../../controllers/orders.controller";
import { deliverySTatusUpdateValidator, orderSTatusUpdateValidator } from "../../../validators/order/order.validator";
import { authorization } from "../../../middlewares/authenticate";
import { addGiftSetProductOrder } from "../../services/orders.service";

export default  (app: Router) => {

    app.get("/order/list", [authorization], getAllOrdersListAdminFn)
    app.post("/order/detail", [authorization], orderDetailsAPIAdminFn)
    app.put("/order/status/update", [authorization, orderSTatusUpdateValidator], orderStatusUpdateFn)
    app.put("/order/delivery/status", [authorization, deliverySTatusUpdateValidator], deliveryStatusUpdateFn )
    app.get("/order/transaction/list", [authorization], orderTransactionListFn)

    ////////////////-----Gift set product Order --------///////////////

    app.get("/order/gift-set/list", [authorization], getAllGiftSetOrdersListAdminFn)
    app.post("/order/gift-set/details", [authorization], giftSetOrderDetailsAPIAdminFn)
    app.put("/order/gift-set/status/update", [authorization, orderSTatusUpdateValidator], giftSetOrderStatusUpdateFn)
    app.put("/order/gift-set/delivery/status", [authorization, deliverySTatusUpdateValidator], giftSetDeliveryStatusUpdateFn )

    app.post("/order/details",[authorization],orderDetailsAPIFn)

}