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
  cartProductListgustCheckOutFn,
  configProductPriceFindFn,
  addGiftSetProductAPIFn,
  getAllGiftSetProductsFn,
  getByIDGiftSetProductsFn,
  editGiftSetProductApiFn,
  statusUpdateGiftSetProductFn,
  deleteGiftSetProductFn,
  deleteGiftSetProductImageFn,
  getAllGiftSetProductsUserSideFn,
  getByIDGiftSetProductsUsersFn,
  configProductlistInAdminFn,
  addToCartConfigProductAPIFn,
  cartConfigProductListByUSerIdFn,
  addConfigProductsOneCombinationFromCSVFileFn,
  getBySKUConfigProductDetailsFn,
  addProductWithVariantFn,
  addVariantProductsFromCSVFileFn,
  addVariantProductIntoWishListFn,
  getVariantProductWishlistByUserIdFn,
  deleteVariantProductWishListFn,
  getAllProductImageNamePublicAPIFn,
  threeStoneConfigProductlistInAdminFn,
  configProductDetailsAPIForAdminFn,
  getAllProductSlugFn,
  addProductImageCSVFileFn,
  similarProductListFn,
  addChooseSettingProductsFromCSVFileFn,
  deleteMultipleProductsFn,
  statusUpdateForMultipleProductsFn,
  getProductImagesUsingS3AndAddInDBFn,
  getWishListProductsForProductListAndDetailFn,
  deleteVariantProductWishListWithProductFn,
  addProductSearchValueFn,
  productSearchListForUserFn,
  deleteProductSearchValueForUserFn,
  popularSearchListFn,
  deleteProductSearchValueForAdminFn,
  recentSearchListFn,
  withoutVariantProductExportFn,
  moveProductCartToWishlistFn,
  getProductQuantityDetailsFn,
} from "../controllers/product.controller";
import {
  authorization,
  customerAuthorization,
  publicAuthentication,
} from "../../middlewares/authenticate";
import {
  reqArrayImageParser,
  reqArrayVideoParser,
  reqProductBulkUploadFileParser,
  reqProductBulkZipFileParser,
  reqSingleImageParser,
} from "../../middlewares/multipart-file-parser";
import {
  activeInactiveProductValidator,
  addProductCartListValidator,
  addProductImagesValidator,
  addProductVideoValidator,
  addProductWishListValidator,
  addProductWithVariantValidator,
  deleteCartProductValidator,
  deleteProductImageValidator,
  deleteProductValidator,
  deleteProductVideoValidator,
  featuredProductValidator,
  saveProductBasicDetailsValidator,
  saveProductMetalDiamondDetailsValidator,
  trendingProductValidator,
} from "../../validators/product/product.validator";
import {
  addProductReviewFn,
  getProductReviewByProductIDFn,
  getProductReviewListDataFn,
  statusUpdateforProductReviewFn,
} from "../controllers/product-review.controller";
import {
  activeInactiveBirthstoneProductFn,
  addBirthStoneProductAPIFn,
  addBirthStoneProductImageFn,
  addBirthStoneProductWithPriceAPIFn,
  addBirthstoneProductsFromCSVFileFn,
  birthstoneProductGetByIdUserSideFn,
  birthstoneProductListUserSideFn,
  birthstoneProductPriceFindFn,
  deleteBirthstoneProductFn,
  editBirthstoneproductApiFn,
  featuredBirthstoneProductStatusUpdateFn,
  getAllBirthstoneProductFn,
  getBirthstoneProductByIdFn,
  trendingBirthstoneProductStatusUpdateFn,
} from "../controllers/birth-stone-product.controller";

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

  app.post("/product/metalTone", productMetalToneListFn);
  app.get("/product/list/user", productListUserSideFn);
  app.get("/product/featured/list", featuredProductListUserSideFn);
  app.get("/product/trending/list", trendingProductListUserSideFn);
  app.post("/product/details/user", productGetByIdUserSideFn);
  app.post("/product/add/metal", [authorization], saveProductMetalOptionFn);
  app.post(
    "/product/wishlist/add",
    [customerAuthorization, addProductWishListValidator],
    addProductWishListFn
  );
  app.post(
    "/product/wishlist/list",
    [customerAuthorization],
    getProductWishListByUserIdFn
  );
  app.post(
    "/product/wishlist/delete",
    [customerAuthorization, addProductWishListValidator],
    deleteProductWishListFn
  );
  app.get("/product/wish/list", [authorization], getProductWishListDataFn);
  app.post(
    "/product/add/data",
    [authorization, saveProductBasicDetailsValidator],
    addProductAllDetailsApiFn
  );
  app.post(
    "/product/edit/data",
    [authorization, saveProductBasicDetailsValidator],
    editproductApiFn
  );

  app.post(
    "/product/cart/add",
    [customerAuthorization, addProductCartListValidator],
    addToCartProductAPIFn
  );
  app.post(
    "/product/cart/list",
    [customerAuthorization],
    cartProductListByUSerIdFn
  );
  app.post(
    "/product/cart/delete",
    [customerAuthorization, deleteCartProductValidator],
    deleteCartProductFn
  );
  app.get(
    "/product/cart/list/admin",
    [authorization],
    getCartProductListDataFn
  );
  app.post("/product/cart/list/gust", cartProductListgustCheckOutFn);

  app.post(
    "/product/review/add",
    [
      customerAuthorization,
      reqArrayImageParser(["images"]),
      addProductWishListValidator,
    ],
    addProductReviewFn
  );
  app.post("/product/review/list", getProductReviewByProductIDFn);
  app.put(
    "/product/review/status",
    [authorization],
    statusUpdateforProductReviewFn
  );
  app.get(
    "/product/review/list/admin",
    [authorization],
    getProductReviewListDataFn
  );

  app.post("/product/wish/cart/count", wishlistCartListCountFn);
  app.get("/product/serach/list", searchProductGloballyFn);

  /////////////---- config product----/////////////////////

  app.post(
    "/product/config/add",
    [authorization, reqProductBulkUploadFileParser("config_csv")],
    addConfigProductBulkFn
  );

  app.post("/product/price/find", configProductPriceFindFn);

  app.get(
    "/config/product/list/admin",
    [authorization],
    configProductlistInAdminFn
  );
  app.get(
    "/admin/config/product/:id",
    [authorization],
    configProductDetailsAPIForAdminFn
  );
  app.get(
    "/three-stone/product/list/admin",
    [authorization],
    threeStoneConfigProductlistInAdminFn
  );

  app.post(
    "/config/product/cart/add",
    [reqSingleImageParser("image")],
    addToCartConfigProductAPIFn
  );

  app.post("/config/product/cart/list", cartConfigProductListByUSerIdFn);

  ///////////------Gift set Product---------///////////////////

  app.post(
    "/gift-set/product/add",
    [
      authorization,
      reqArrayImageParser(["thumb_images", "featured_images", "video"]),
    ],
    addGiftSetProductAPIFn
  );

  app.get("/gift-set/products/list", [authorization], getAllGiftSetProductsFn);

  app.post("/gift-set/products", [authorization], getByIDGiftSetProductsFn);

  app.post(
    "/gift-set/product/edit",
    [
      authorization,
      reqArrayImageParser(["thumb_images", "featured_images", "video"]),
    ],
    editGiftSetProductApiFn
  );

  app.post(
    "/gift-set/products/status",
    [authorization],
    statusUpdateGiftSetProductFn
  );

  app.post(
    "/gift-set/products/delete",
    [authorization],
    deleteGiftSetProductFn
  );

  app.post(
    "/gift-set/products/image/delete",
    [authorization],
    deleteGiftSetProductImageFn
  );

  app.get("/gift-set/products/list/user", getAllGiftSetProductsUserSideFn);

  app.post("/gift-set/products/user", getByIDGiftSetProductsUsersFn);

  ////////////////////---------- Birth stone product ------------- ///////////////////////
  app.post(
    "/product/birth-stone/add",
    [authorization, saveProductBasicDetailsValidator],
    addBirthStoneProductAPIFn
  );

  app.get(
    "/product/birth-stone/list",
    [authorization],
    getAllBirthstoneProductFn
  );

  app.get(
    "/product/birth-stone/:id",
    [authorization],
    getBirthstoneProductByIdFn
  );

  app.put(
    "/product/birth-stone/status",
    [authorization, activeInactiveProductValidator],
    activeInactiveBirthstoneProductFn
  );

  app.get("/product/birth-stone/user/list", birthstoneProductListUserSideFn);

  app.post(
    "/product/birth-stone/details/user",
    birthstoneProductGetByIdUserSideFn
  );

  app.post("/product/birth-stone/price", birthstoneProductPriceFindFn);

  app.post(
    "/product/birth-stone/add/price-add",
    [authorization, saveProductBasicDetailsValidator],
    addBirthStoneProductWithPriceAPIFn
  );

  app.put(
    "/product/birth-stone/featured/status",
    [authorization, featuredProductValidator],
    featuredBirthstoneProductStatusUpdateFn
  );
  app.put(
    "/product/birth-stone/trending/status",
    [authorization, trendingProductValidator],
    trendingBirthstoneProductStatusUpdateFn
  );

  app.put(
    "/product/birth-stone/delete",
    [authorization, deleteProductValidator],
    deleteBirthstoneProductFn
  );

  app.put(
    "/product/birth-stone/edit",
    [authorization, saveProductBasicDetailsValidator],
    editBirthstoneproductApiFn
  );

  app.post(
    "/product/birth-stone/image/add",
    [authorization, reqSingleImageParser("image")],
    addBirthStoneProductImageFn
  );

  /* new diamond master base One combination config product */

  app.post(
    "/product/config/one-combination/add",
    [reqProductBulkUploadFileParser("config_csv")],
    addConfigProductsOneCombinationFromCSVFileFn
  );

  /* Birthstone product add with price base on metal and metal tone */

  app.post(
    "/product/birth-stone/bulk/add",
    [authorization, reqProductBulkUploadFileParser("config_csv")],
    addBirthstoneProductsFromCSVFileFn
  );

  /* config product find based on sku */

  app.get("/product/config/:slug", getBySKUConfigProductDetailsFn);

  /* single product add with variant */

  app.post(
    "/product/variant",
    [authorization, addProductWithVariantValidator],
    addProductWithVariantFn
  );

  /* variant product add using BULK upload */

  app.post(
    "/product/variant/product-csv",
    [authorization, reqProductBulkUploadFileParser("product_csv")],
    addVariantProductsFromCSVFileFn
  );

  /* choose setting product add using BULK upload */
  app.post(
    "/product/choose-setting/product-csv",
    [authorization, reqProductBulkUploadFileParser("product_csv")],
    addChooseSettingProductsFromCSVFileFn
  );

  /* ------------------- variant product wish list CRUD ----------------------- */

  app.post(
    "/product/variant/wishlist",
    [reqSingleImageParser("image")],
    [customerAuthorization, addProductWishListValidator],
    addVariantProductIntoWishListFn
  );
  app.get(
    "/product/variant/wishlist/:user_id",
    [customerAuthorization],
    getVariantProductWishlistByUserIdFn
  );

  app.get(
    "/product-wishlist/:user_id",
    getWishListProductsForProductListAndDetailFn
  );
  app.delete(
    "/product/variant/wishlist/:user_id/:whishlist_id",
    [customerAuthorization],
    deleteVariantProductWishListFn
  );
  app.patch(
    "/product/variant/wishlist-delete",
    [customerAuthorization],
    deleteVariantProductWishListWithProductFn
  );
  app.post(
    "/public/product-images",
    [publicAuthentication],
    getAllProductImageNamePublicAPIFn
  );
  app.get("/product-slug", getAllProductSlugFn);
  app.post(
    "/product-image-csv",
    [authorization, reqProductBulkUploadFileParser("product_image_csv")],
    addProductImageCSVFileFn
  );
  app.get("/similar-product/:slug", similarProductListFn);

  app.get("/export/without-variant-products", withoutVariantProductExportFn);

  /* bulk delete and bulk status update for product */

  app.put("/products-delete", [authorization], deleteMultipleProductsFn);
  app.put(
    "/products-status",
    [authorization],
    statusUpdateForMultipleProductsFn
  );

  /* get product images using s3 & add image in db */

  app.post("/product/get-image-s3-add-db", getProductImagesUsingS3AndAddInDBFn);

  app.post("/user/product-search", addProductSearchValueFn);
  app.get("/user/product-search", productSearchListForUserFn);
  app.delete("/user/product-search/:ids", deleteProductSearchValueForUserFn);

  app.get("/product-popular-search", [authorization], popularSearchListFn);
  app.get("/product-recent-search", [authorization], recentSearchListFn);
  app.delete(
    "/product-search/:ids",
    [authorization],
    deleteProductSearchValueForAdminFn
  );

  app.post(
    "/product/wishlist/:cart_id",
    [customerAuthorization],
    moveProductCartToWishlistFn
  );

  app.get("/admin/product/quantity/:sku", [authorization], getProductQuantityDetailsFn);
};
