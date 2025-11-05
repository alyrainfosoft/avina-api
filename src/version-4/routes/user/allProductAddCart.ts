import { Router } from "express";
import { reqSingleImageParser } from "../../../middlewares/multipart-file-parser";

import { customerAuthorization } from "../../../middlewares/authenticate";
import { currencyMiddleware } from "../../../middlewares/currency-rate-change";
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
} from "../../controllers/all-product-add-cart.controller";

export default (app: Router) => {
  app.post(
    "/all/product/cart/add",
    [reqSingleImageParser("image")],
    addToCartAllProductAPIFn
  );
  // app.post("/all/product/cart/list", cartAllProductListByUSerIdFn);
  app.post("/all/product/add/order", addAllTypeProductWithPaypalOrderFn);
  // app.post(
  //   "/all/product/add/payment/paypal",
  //   allTypeProductPaymentTransactionWithPaypalFn
  // );
  app.post(
    "/all/product/add/payment/affirm",
    allTypeProductPaymentTransactionWithAffirmFn
  );
  app.post(
    "/all/retail/product/cart/list",
    [currencyMiddleware],
    cartAllWithBirthstoneProductRetailListByUSerIdFn
  );

  /* -------------- cart list API for shop now ---------------------- */
  app.get(
    "/cart/:cart_ids",
    [currencyMiddleware],
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
