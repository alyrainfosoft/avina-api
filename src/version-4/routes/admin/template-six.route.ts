import { Router } from "express";

import {
  addBannerFn,
  addDiamondShapeSectionFn,
  addShapeMarqueSectionFn,
  addShopBySectionFn,
  addSparkleSectionFn,
  deleteBannerFn,
  deleteDiamondShapeSectionFn,
  deleteShapeMarqueSectionFn,
  deleteShopBySectionFn,
  deleteSparkleSectionFn,
  getBannerFn,
  getDiamondShapeSectionFn,
  getInstagramSectionFn,
  getShapeMarqueSectionFn,
  getShopBySectionFn,
  getSparkleSectionFn,
  productSKUListFn,
  statusUpdateForBannerFn,
  statusUpdateForDiamondShapeSectionFn,
  statusUpdateForShapeMarqueSectionFn,
  statusUpdateForShopBySectionFn,
  statusUpdateForSparkleSectionFn,
  templateSixAllSectionDetailForUserFn,
  templateSixAllSectionListForUserFn,
  updateBannerFn,
  updateDiamondShapeSectionFn,
  updateInstagramSectionFn,
  updateShapeMarqueSectionFn,
  updateShopBySectionFn,
  updateSparkleSectionFn,
} from "../../controllers/template-six.controller";
import { authorization } from "../../../middlewares/authenticate";
import {
  reqArrayImageParser,
  reqSingleImageParser,
} from "../../../middlewares/multipart-file-parser";
import { addProductDropdownFn } from "../../controllers/masters/master.controller";

export default (app: Router) => {
  /* Splash Screen */

  app.post(
    "/template-six/banner",
    [authorization, reqArrayImageParser(["image", "mobile_image"])],
    addBannerFn
  );
  app.get("/template-six/banner", [authorization], getBannerFn);
  app.put(
    "/template-six/banner/:id",
    [authorization, reqArrayImageParser(["image", "mobile_image"])],
    updateBannerFn
  );
  app.delete("/template-six/banner/:id", [authorization], deleteBannerFn);
  app.patch(
    "/template-six/banner/:id",
    [authorization],
    statusUpdateForBannerFn
  );

  /* Diamond Shape Section */
  app.post(
    "/template-six/diamond-shape",
    [
      authorization,
      reqArrayImageParser(["image", "title_image", "hover_image"]),
    ],
    addDiamondShapeSectionFn
  );
  app.get(
    "/template-six/diamond-shape",
    [authorization],
    getDiamondShapeSectionFn
  );
  app.put(
    "/template-six/diamond-shape/:id",
    [
      authorization,
      reqArrayImageParser(["image", "title_image", "hover_image"]),
    ],
    updateDiamondShapeSectionFn
  );
  app.delete(
    "/template-six/diamond-shape/:id",
    [authorization],
    deleteDiamondShapeSectionFn
  );
  app.patch(
    "/template-six/diamond-shape/:id",
    [authorization],
    statusUpdateForDiamondShapeSectionFn
  );

  /* shop by Section  - category,style,event*/
  app.post(
    "/template-six/shop-by",
    [authorization, reqArrayImageParser(["image", "hover_image"])],
    addShopBySectionFn
  );
  app.get("/template-six/shop-by", [authorization], getShopBySectionFn);
  app.put(
    "/template-six/shop-by/:id",
    [authorization, reqArrayImageParser(["image", "hover_image"])],
    updateShopBySectionFn
  );
  app.delete(
    "/template-six/shop-by/:id",
    [authorization],
    deleteShopBySectionFn
  );
  app.patch(
    "/template-six/shop-by/:id",
    [authorization],
    statusUpdateForShopBySectionFn
  );

  /* sparkle section */
  app.post("/template-six/sparkle", [authorization], addSparkleSectionFn);
  app.get("/template-six/sparkle", [authorization], getSparkleSectionFn);
  app.put("/template-six/sparkle/:id", [authorization], updateSparkleSectionFn);
  app.delete(
    "/template-six/sparkle/:id",
    [authorization],
    deleteSparkleSectionFn
  );
  app.patch(
    "/template-six/sparkle/:id",
    [authorization],
    statusUpdateForSparkleSectionFn
  );
  /* shape marque section */
  app.post(
    "/template-six/shape-marque",
    [authorization, reqArrayImageParser(["outline_image", "fill_image"])],
    addShapeMarqueSectionFn
  );
  app.get(
    "/template-six/shape-marque",
    [authorization],
    getShapeMarqueSectionFn
  );
  app.put(
    "/template-six/shape-marque/:id",
    [authorization, reqArrayImageParser(["outline_image", "fill_image"])],
    updateShapeMarqueSectionFn
  );
  app.delete(
    "/template-six/shape-marque/:id",
    [authorization],
    deleteShapeMarqueSectionFn
  );
  app.patch(
    "/template-six/shape-marque/:id",
    [authorization],
    statusUpdateForShapeMarqueSectionFn
  );

 
  /* instagram Section */

  app.get("/template-six/instagram", [authorization], getInstagramSectionFn);
  app.post(
    "/template-six/instagram",
    [authorization],
    updateInstagramSectionFn
  );

  app.get("/product-sku",[authorization], productSKUListFn);
  app.get("/template-6/add-product/dropDown/list",[authorization], addProductDropdownFn);
  app.get("/temp-6/product-sku",[authorization], productSKUListFn);

};
