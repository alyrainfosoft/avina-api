import { RequestHandler } from "express"
import { activeInactiveBirthstoneProduct, addBirthStoneProductAPI, addBirthStoneProductImage, addBirthStoneProductWithPriceAPI, birthstoneProductGetByIdUserSide, birthstoneProductListUserSide, birthstoneProductPriceFind, deleteBirthstoneProduct, editBirthstoneproductApi, featuredBirthstoneProductStatusUpdate, getAllBirthstoneProduct, getBirthstoneProductById, trendingBirthstoneProductStatusUpdate } from "../services/birth-stone-product.service"
import { addBirthstoneProductsFromCSVFile } from "../services/birthstone-product-bulk-upload.service"
import { callServiceMethod } from "./base.controller"

export const addBirthStoneProductAPIFn: RequestHandler = (req, res) => {
    callServiceMethod(req, res, addBirthStoneProductAPI(req), "addBirthStoneProductAPIFn")
}

export const getAllBirthstoneProductFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllBirthstoneProduct(req), "getAllBirthstoneProductFn")
}

export const getBirthstoneProductByIdFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getBirthstoneProductById(req), "getBirthstoneProductByIdFn")
}

export const activeInactiveBirthstoneProductFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, activeInactiveBirthstoneProduct(req), "activeInactiveBirthstoneProductFn")
}

export const featuredBirthstoneProductStatusUpdateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, featuredBirthstoneProductStatusUpdate(req), "featuredBirthstoneProductStatusUpdateFn")
}

export const trendingBirthstoneProductStatusUpdateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, trendingBirthstoneProductStatusUpdate(req), "trendingBirthstoneProductStatusUpdateFn")
}

export const deleteBirthstoneProductFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteBirthstoneProduct(req), "deleteBirthstoneProductFn")
}

export const editBirthstoneproductApiFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, editBirthstoneproductApi(req), "editBirthstoneproductApiFn")
}

export const birthstoneProductListUserSideFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, birthstoneProductListUserSide(req), "birthstoneProductListUserSideFn")
}

export const birthstoneProductGetByIdUserSideFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, birthstoneProductGetByIdUserSide(req), "birthstoneProductGetByIdUserSideFn")
}

export const birthstoneProductPriceFindFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, birthstoneProductPriceFind(req), "birthstoneProductPriceFindFn")
}

export const addBirthStoneProductImageFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addBirthStoneProductImage(req), "addBirthStoneProductImageFn")
}

///////------- Birthstone product with price base on metal and metone----/////////////

export const addBirthStoneProductWithPriceAPIFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addBirthStoneProductWithPriceAPI(req), "addBirthStoneProductWithPriceAPIFn")
}
/* Birthstone product with price base on metal and metone */

export const addBirthstoneProductsFromCSVFileFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addBirthstoneProductsFromCSVFile(req), "addBirthstoneProductsFromCSVFileFn")

}