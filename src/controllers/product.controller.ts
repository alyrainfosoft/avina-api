import { RequestHandler } from "express";
import { addProductZip, addProductsFromCSVFile } from "../services/product-bulk-upload.service";
import {
  activeInactiveProduct,
  deleteProduct,
  getProductById,
  getAllProduct,
  saveProductBasicDetails,
  saveMetalDiamondDetails,
  addProductImages,
  addProductVideos,
  deleteProductImages,
  deleteProductVideos,
  productMetalToneList,
  productListUserSide,
  productGetByIdUserSide,
  saveProductMetalOption,
  featuredProductListUserSide,
  trendingProductListUserSide,
  featuredProductStatusUpdate,
  trendingProductStatusUpdate,
  addProductAllDetailsApi,
  wishlistCartListCount,
  searchProductGlobally,
  editproductApi,
} from "../services/product.services";
import { callServiceMethod } from "./base.controller";
import { addProductWishList, deleteProductWishList, getProductWishListByUserId, getProductWishListData } from "../services/product-wishlist.service";
import { addToCartProductAPI, cartProductListByUSerId, deleteCartProduct, getCartProductListData } from "../services/cart-product.service";
import { addConfigProductsFromCSVFile, configProductPriceFind } from "../services/config-product-bulk.service";

export const getAllProductFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getAllProduct(req), "getAllProductFn");
};

export const getProductByIdFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getProductById(req), "getProductByIdFn");
};

export const activeInactiveProductFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    activeInactiveProduct(req),
    "activeInactiveProductFn"
  );
};

export const deleteProductFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteProduct(req), "deleteProductFn");
};

export const addProductsFromCSVFileFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addProductsFromCSVFile(req),
    "addProductsFromCSVFileFn"
  );
};

export const addProductsZipFileFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    addProductZip(req),
    "addProductsZipFileFn"
  );
};

export const saveProductBasicDetailsFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    saveProductBasicDetails(req),
    "saveProductBasicDetailsFn"
  );
};

export const saveMetalDiamondDetailsFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    saveMetalDiamondDetails(req),
    "saveMetalDiamondDetailsFn"
  );
};

export const addProductImagesFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addProductImages(req), "addProductImagesFn");
};

export const addProductVideosFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addProductVideos(req), "addProductVideosFn");
};

export const deleteProductImagesFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteProductImages(req),
    "deleteProductImagesFn"
  );
};

export const deleteProductVideosFn: RequestHandler = (req, res) => {
  callServiceMethod(
    req,
    res,
    deleteProductVideos(req),
    "deleteProductVideosFn"
  );
};

export const getProductWishListDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getProductWishListData(req), "getProductWishListDataFn")
}

export const productMetalToneListFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, productMetalToneList(req), "productMetalToneListFn")
}

export const productListUserSideFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, productListUserSide(req), "productListUserSideFn")
}

export const productGetByIdUserSideFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, productGetByIdUserSide(req), "productGetByIdUserSideFn")
}

export const saveProductMetalOptionFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, saveProductMetalOption(req), "saveProductMetalOptionFn")
}

export const featuredProductListUserSideFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, featuredProductListUserSide(req), "featuredProductListUserSideFn")
}

export const trendingProductListUserSideFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, trendingProductListUserSide(req), "trendingProductListUserSideFn")
}

export const featuredProductStatusUpdateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, featuredProductStatusUpdate(req), "featuredProductStatusUpdateFn")
}

export const trendingProductStatusUpdateFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, trendingProductStatusUpdate(req), "trendingProductStatusUpdateFn")
}

export const addProductWishListFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addProductWishList(req), "addProductWishListFn")
}

export const getProductWishListByUserIdFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getProductWishListByUserId(req), "getProductWishListByUserIdFn")
}

export const deleteProductWishListFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteProductWishList(req), "deleteProductWishListFn")
}

export const addProductAllDetailsApiFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addProductAllDetailsApi(req), "addProductAllDetailsApiFn")
}

export const editproductApiFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, editproductApi(req), "editproductApiFn")
}

/////////----  cart product --/////////////////
export const addToCartProductAPIFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addToCartProductAPI(req), "addToCartProductAPIFn")
}

export const cartProductListByUSerIdFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, cartProductListByUSerId(req), "cartProductListByUSerIdFn")
}

export const deleteCartProductFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, deleteCartProduct(req), "deleteCartProductFn")
}

export const getCartProductListDataFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, getCartProductListData(req), "getCartProductListDataFn")
}

/////////////--- count ----/////////////////////////

export const wishlistCartListCountFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, wishlistCartListCount(req), "wishlistCartListCountFn")
}

export const searchProductGloballyFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, searchProductGlobally(req), "searchProductGloballyFn")
}

////////////--- config product -----//////////////////

export const addConfigProductBulkFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, addConfigProductsFromCSVFile(req), "addConfigProductBulkFn")
}

export const configProductPriceFindFn: RequestHandler = (req, res) => {
  callServiceMethod(req, res, configProductPriceFind(req), "configProductPriceFindFn")
}