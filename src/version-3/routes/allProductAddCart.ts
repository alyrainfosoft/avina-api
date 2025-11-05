import { Router } from "express";
import { reqSingleImageParser } from "../../middlewares/multipart-file-parser";
import {
  addAllTypeProductWithPaypalOrderFn,
  addToCartAllProductAPIFn,
  allTypeProductPaymentTransactionWithAffirmFn,
  allTypeProductPaymentTransactionWithPaypalFn,
  cartAllProductListByUSerIdFn,
  cartAllWithBirthstoneProductRetailListByUSerIdFn,
  cartQuantityUpdateFn,
  getShopNowCartListFn,
  mergeCartAddProductAPIFn,
} from "../controllers/all-product-add-cart.controller";
import { cartAllWithBirthstoneProductRetailListByUSerId } from "../services/all-product-cart.service";
import { customerAuthorization } from "../../middlewares/authenticate";

export default (app: Router) => {
  app.post(
    "/all/product/cart/add",
    [reqSingleImageParser("image")],
    addToCartAllProductAPIFn
  );
  app.post("/all/product/cart/list/user", cartAllProductListByUSerIdFn);
  app.post("/all/product/add/order", addAllTypeProductWithPaypalOrderFn);
  app.post(
    "/all/product/add/payment/paypal",
    allTypeProductPaymentTransactionWithPaypalFn
  );
  app.post(
    "/all/product/add/payment/affirm",
    allTypeProductPaymentTransactionWithAffirmFn
  );
  app.post(
    "/all/retail/product/cart/list/user",
    cartAllWithBirthstoneProductRetailListByUSerIdFn
  );

  /* -------------- cart list API for shop now ---------------------- */
  app.get(
    "/user/cart/:cart_ids",
    getShopNowCartListFn
  );
  /* ------------------------ merge cart API (without login add to cart product then user can login then add product in cart ) */

  app.post(
    "/all/product/cart/merge",
    [customerAuthorization],
    mergeCartAddProductAPIFn
  );
  app.post("/cart/quantity/:cart_id", cartQuantityUpdateFn);
};
