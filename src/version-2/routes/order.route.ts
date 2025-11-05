import { Router } from "express";
import { addConfigProductOrderFn, addGiftSetProductOrderFn, addProductOrderFn, addProductWithPaypalOrderFn, configOrderDetailsAPIFn, deliveryStatusUpdateFn, getAllConfigOrdersUserFn, getAllGiftSetOrdersListAdminFn, getAllGiftSetProductOrdersUserFn, getAllOrdersListAdminFn, getAllOrdersUserFn, giftSetDeliveryStatusUpdateFn, giftSetOrderDetailsAPIAdminFn, giftSetOrderDetailsAPIFn, giftSetOrderStatusUpdateFn, orderDetailsAPIAdminFn, orderDetailsAPIFn, orderStatusUpdateFn, orderTransactionListFn } from "../controllers/orders.controller";
import { deliverySTatusUpdateValidator, orderSTatusUpdateValidator } from "../../validators/order/order.validator";
import { authorization } from "../../middlewares/authenticate";
import { addGiftSetProductOrder } from "../services/orders.service";

export default  (app: Router) => {
    app.post("/order/add", addProductOrderFn)
    app.get("/order/list/user", getAllOrdersUserFn)
    app.post("/order/details",  orderDetailsAPIFn)
    
    app.get("/order/list/admin", [authorization], getAllOrdersListAdminFn)
    app.post("/order/details/admin", [authorization], orderDetailsAPIAdminFn)
    app.put("/order/status/update", [authorization, orderSTatusUpdateValidator], orderStatusUpdateFn)
    app.put("/order/delivery/status", [authorization, deliverySTatusUpdateValidator], deliveryStatusUpdateFn )
    app.get("/order/transaction/list", [authorization], orderTransactionListFn)

    ////////////////-----Gift set product Order --------///////////////

    app.post("/order/gift-set/add", addGiftSetProductOrderFn)
    app.get("/order/gift-set/list/user", getAllGiftSetProductOrdersUserFn)
    app.post("/order/gift-set/details",  giftSetOrderDetailsAPIFn)

    app.get("/order/gift-set/list/admin", [authorization], getAllGiftSetOrdersListAdminFn)
    app.post("/order/gift-set/details/admin", [authorization], giftSetOrderDetailsAPIAdminFn)
    app.put("/order/gift-set/status/update", [authorization, orderSTatusUpdateValidator], giftSetOrderStatusUpdateFn)
    app.put("/order/gift-set/delivery/status", [authorization, deliverySTatusUpdateValidator], giftSetDeliveryStatusUpdateFn )

    ////////////////-----config product Order --------///////////////

    app.post("/config/product/order/add", addConfigProductOrderFn)
    app.get("/config/product/order/list/user", getAllConfigOrdersUserFn)
    app.post("/config/product/order/details",  configOrderDetailsAPIFn)

    ////////------------ paypal paymentmethod with order ----------/////////

    app.post("/order/paypal/add", addProductWithPaypalOrderFn)
    
}