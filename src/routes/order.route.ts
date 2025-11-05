import { Router } from "express";
import { addProductOrderFn, deliveryStatusUpdateFn, getAllOrdersListAdminFn, getAllOrdersUserFn, orderDetailsAPIAdminFn, orderDetailsAPIFn, orderStatusUpdateFn, orderTransactionListFn } from "../controllers/orders.controller";
import { deliverySTatusUpdateValidator, orderSTatusUpdateValidator } from "../validators/order/order.validator";
import { authorization } from "../middlewares/authenticate";

export default  (app: Router) => {
    app.post("/order/add", addProductOrderFn)
    app.get("/order/list/user", getAllOrdersUserFn)
    app.post("/order/details",  orderDetailsAPIFn)
    
    app.get("/order/list/admin", [authorization], getAllOrdersListAdminFn)
    app.post("/order/details/admin", [authorization], orderDetailsAPIAdminFn)
    app.put("/order/status/update", [authorization, orderSTatusUpdateValidator], orderStatusUpdateFn)
    app.put("/order/delivery/status", [authorization, deliverySTatusUpdateValidator], deliveryStatusUpdateFn )
    app.get("/order/transaction/list", [authorization], orderTransactionListFn)
}