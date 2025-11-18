import { Router } from "express";
import { addOffersAndDiscountFn, changeStatusOfferAndDiscountFn, deleteOfferAndDiscountFn, editOfferAndDiscountFn, generateCouponCodeFn, getAllOfferAndDiscountFn } from "../../controllers/offers-discount.controller";
import { reqSingleImageParser } from "../../../middlewares/multipart-file-parser";
import { authorization } from "../../../middlewares/authenticate";

export default (app: Router) => {

  app.post("/offer-and-discount",[authorization, reqSingleImageParser('image')], addOffersAndDiscountFn);
  app.get("/offer-and-discount", getAllOfferAndDiscountFn);
  app.get("/offer-and-discount/:offer_id", getAllOfferAndDiscountFn);
  app.get("/generateCouponCode", generateCouponCodeFn);  
  app.put("/offer-and-discount/:offer_id",[reqSingleImageParser('image')],editOfferAndDiscountFn);
  app.patch("/offer-and-discount/:offer_id", changeStatusOfferAndDiscountFn);
  app.delete("/offer-and-discount/:offer_id", deleteOfferAndDiscountFn);

};