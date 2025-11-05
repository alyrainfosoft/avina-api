import { RequestHandler } from "express";
import { callServiceMethod } from "./base.controller";
import { addAllTypeProductWithPaypalOrder, addToCartAllProductAPI, allTypeProductPaymentTransactionWithAffirm, allTypeProductPaymentTransactionWithPaypal, cartAllProductListByUSerId, cartAllWithBirthstoneProductRetailListByUSerId, cartQuantityUpdate, getShopNowCartList, mergeCartAddProductAPI } from "../services/all-product-cart.service";

export const addToCartAllProductAPIFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addToCartAllProductAPI(req), "addToCartAllProductAPIFn");
  };

  export const cartAllProductListByUSerIdFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, cartAllProductListByUSerId(req), "cartAllProductListByUSerIdFn");
  };

  export const cartAllWithBirthstoneProductRetailListByUSerIdFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, cartAllWithBirthstoneProductRetailListByUSerId(req), "cartAllWithBirthstoneProductRetailListByUSerIdFn");
  };

  export const addAllTypeProductWithPaypalOrderFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addAllTypeProductWithPaypalOrder(req), "addAllTypeProductWithPaypalOrderFn");
  };

  export const allTypeProductPaymentTransactionWithPaypalFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, allTypeProductPaymentTransactionWithPaypal(req), "allTypeProductPaymentTransactionWithPaypalFn");
  };

  export const allTypeProductPaymentTransactionWithAffirmFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, allTypeProductPaymentTransactionWithAffirm(req), "allTypeProductPaymentTransactionWithPaypalFn");
  };

  /* ------------------------ merge cart API (without login add to cart product then user can login then add product in cart ) */

  export const mergeCartAddProductAPIFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, mergeCartAddProductAPI(req), "mergeCartAddProductAPIFn");
  };

  /* -------------- quntity update API ---------------------- */

  export const cartQuantityUpdateFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, cartQuantityUpdate(req), "cartQuantityUpdateFn");
  };

/* ------------------------ cart list API for shop now ---------------------- */
  export const getShopNowCartListFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, getShopNowCartList(req), "getShopNowCartListFn");
  };