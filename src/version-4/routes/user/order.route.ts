import { Router } from "express";
import { addConfigProductOrderFn, addGiftSetProductOrderFn, addProductOrderFn, addProductWithPaypalOrderFn, configOrderDetailsAPIFn, getAllConfigOrdersUserFn, getAllGiftSetProductOrdersUserFn, getAllOrdersUserFn , giftSetOrderDetailsAPIFn, orderDetailsAPIFn } from "../../controllers/orders.controller";

export default  (app: Router) => {
    app.post("/order/add", addProductOrderFn)
    app.get("/order/list", getAllOrdersUserFn)
    app.post("/order/details", orderDetailsAPIFn)
    
    ////////////////-----Gift set product Order --------///////////////

    // app.post("/order/gift-set/add", addGiftSetProductOrderFn)
    app.get("/order/gift-set/list", getAllGiftSetProductOrdersUserFn)
    app.post("/order/gift-set/details",  giftSetOrderDetailsAPIFn)

   
    ////////////////-----config product Order --------///////////////

    app.post("/config/product/order/add", addConfigProductOrderFn)
    // app.get("/config/product/order/list", getAllConfigOrdersUserFn)
    app.post("/config/product/order/details",  configOrderDetailsAPIFn)

    ////////------------ paypal paymentmethod with order ----------/////////

    app.post("/order/paypal/add", addProductWithPaypalOrderFn)
    
}