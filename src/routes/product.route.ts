import { Router } from "express";
import {
  activeInactiveProductFn,
  deleteProductFn,
  getProductByIdFn,
  getAllProductFn,
  addProductsFromCSVFileFn,
  saveProductBasicDetailsFn,
  saveMetalDiamondDetailsFn,
  addProductImagesFn,
  addProductVideosFn,
  deleteProductImagesFn,
  deleteProductVideosFn,
  productMetalToneListFn,
  productListUserSideFn,
  productGetByIdUserSideFn,
  saveProductMetalOptionFn,
  trendingProductListUserSideFn,
  featuredProductListUserSideFn,
  featuredProductStatusUpdateFn,
  trendingProductStatusUpdateFn,
  addProductWishListFn,
  getProductWishListByUserIdFn,
  deleteProductWishListFn,
  getProductWishListDataFn,
  addProductAllDetailsApiFn,
  addToCartProductAPIFn,
  cartProductListByUSerIdFn,
  deleteCartProductFn,
  getCartProductListDataFn,
  wishlistCartListCountFn,
  addProductsZipFileFn,
  searchProductGloballyFn,
  editproductApiFn,
  addConfigProductBulkFn,
  configProductPriceFindFn,
} from "../controllers/product.controller";
import { authorization, customerAuthorization } from "../middlewares/authenticate";
import {
  reqArrayImageParser,
  reqArrayVideoParser,
  reqProductBulkUploadFileParser,
  reqProductBulkZipFileParser,
} from "../middlewares/multipart-file-parser";
import {
  activeInactiveProductValidator,
  addProductImagesValidator,
  addProductVideoValidator,
  addProductWishListValidator,
  deleteProductImageValidator,
  deleteProductValidator,
  deleteProductVideoValidator,
  featuredProductValidator,
  saveProductBasicDetailsValidator,
  saveProductMetalDiamondDetailsValidator,
  trendingProductValidator,
} from "../validators/product/product.validator";
import { addProductReviewFn, getProductReviewByProductIDFn, getProductReviewListDataFn, statusUpdateforProductReviewFn } from "../controllers/product-review.controller";

export default (app: Router) => {
  app.get("/product", [authorization], getAllProductFn);
  app.get("/product/:id", [authorization], getProductByIdFn);

  app.post(
    "/active-inactive-product",
    [authorization, activeInactiveProductValidator],
    activeInactiveProductFn
  );
  app.post(
    "/product/featured/status",
    [authorization, featuredProductValidator],
    featuredProductStatusUpdateFn
  );
  app.post(
    "/product/trending/status",
    [authorization, trendingProductValidator],
    trendingProductStatusUpdateFn
  );
  app.post(
    "/product",
    [authorization, deleteProductValidator],
    deleteProductFn
  );
  app.post(
    "/product-csv",
    [authorization, reqProductBulkUploadFileParser("product_csv")],
    addProductsFromCSVFileFn
  );

  app.post(
    "/product-imagezip",
    [authorization, reqProductBulkZipFileParser("product_zip")],
    addProductsZipFileFn
  );
  app.post(
    "/product-basic-details",
    [authorization, saveProductBasicDetailsValidator],
    saveProductBasicDetailsFn
  );
  app.post(
    "/product-metal-diamond-details",
    [authorization, saveProductMetalDiamondDetailsValidator],
    saveMetalDiamondDetailsFn
  );
  app.post(
    "/product-images",
    [authorization, reqArrayImageParser(["images"]), addProductImagesValidator],
    addProductImagesFn
  );
  app.post(
    "/product-videos",
    [authorization, reqArrayVideoParser(["videos"]), addProductVideoValidator],
    addProductVideosFn
  );
  app.post(
    "/product-images/deleted",
    [authorization, deleteProductImageValidator],
    deleteProductImagesFn
  );
  app.delete(
    "/product-videos",
    [authorization, deleteProductVideoValidator],
    deleteProductVideosFn
  );

  app.post("/product/metalTone",  productMetalToneListFn)
  app.get("/product/list/user",  productListUserSideFn)
  app.get("/product/featured/list",  featuredProductListUserSideFn)
  app.get("/product/trending/list",  trendingProductListUserSideFn)
  app.post("/product/details/user", productGetByIdUserSideFn)  
  app.post("/product/add/metal",[authorization], saveProductMetalOptionFn)
  app.post("/product/wishlist/add", [customerAuthorization, addProductWishListValidator], addProductWishListFn)
  app.post("/product/wishlist/list",[customerAuthorization], getProductWishListByUserIdFn)
  app.post("/product/wishlist/delete", [customerAuthorization, addProductWishListValidator], deleteProductWishListFn)
  app.get("/product/wish/list", [authorization], getProductWishListDataFn)
  app.post("/product/add/data",[authorization, saveProductBasicDetailsValidator], addProductAllDetailsApiFn)
  app.post("/product/edit/data", [authorization, saveProductBasicDetailsValidator], editproductApiFn)

  app.post("/product/cart/add", [customerAuthorization, addProductWishListValidator], addToCartProductAPIFn)
  app.post("/product/cart/list", [customerAuthorization],cartProductListByUSerIdFn)
  app.post("/product/cart/delete", [customerAuthorization, addProductWishListValidator], deleteCartProductFn)
  app.get("/product/cart/list/admin", [authorization], getCartProductListDataFn)

  app.post("/product/review/add", [customerAuthorization, reqArrayImageParser(["images"]), addProductWishListValidator], addProductReviewFn)
  app.post("/product/review/list", getProductReviewByProductIDFn)
  app.put("/product/review/status", [authorization], statusUpdateforProductReviewFn)
  app.get("/product/review/list/admin", [authorization], getProductReviewListDataFn)

  app.post("/product/wish/cart/count", wishlistCartListCountFn)
  app.get("/product/serach/list", searchProductGloballyFn)

  /////////////---- config product----/////////////////////

  app.post(
    "/product/config/add",
    [authorization, reqProductBulkUploadFileParser("config_csv")],
    addConfigProductBulkFn
  );

  app.post(
    "/product/price/find",
    [authorization],
    configProductPriceFindFn
  );

};
