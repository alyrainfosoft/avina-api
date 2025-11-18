import { Router } from "express";
import { authorization } from "../../../middlewares/authenticate";
import { addAncientSectionFn, addAndUpdatepdateJewelrySectionFn, addAndUpdatePerfectJewelrySectionFn, addAntiqueSectionFn, addBannerSectionFn, addJewellryCategoriesSectionFn, addJournalSectionFn, addProductAndCategorySectionFn, addUpdateTemplateFourProductsFn, deleteAncientSectionFn, deleteAntiqueSectionFn, deleteBannerSectionFn, deleteJewellryCategoriesSectionFn, deleteJewelrySectionFn, deleteJournalSectionFn, deletePerfectJewelrySectionFn, deleteProductAndCategorySectionFn, getALlTemplateFourProductsFn, getAncientSectionFn, getAntiqueSectionFn, getBannerSectionFn, getJewellryCategoriesSectionFn, getJewelrySectionFn, getJournalSectionFn, getPerfectJewelrySectionFn, getProductAndCategorySectionFn, statusUpdateForAncientSectionFn, statusUpdateForAntiqueSectionFn, statusUpdateForBannerSectionFn, statusUpdateForJewellryCategoriesSectionFn, statusUpdateForJewelrySectionFn, statusUpdateForJournalSectionFn, statusUpdateForPerfectJewelrySectionFn, statusUpdateForProductAndCategorySectionFn, updateAncientSectionFn, updateAntiqueSectionFn, updateBannerSectionFn, updateJewellryCategoriesSectionFn, updateJournalSectionFn, updateProductAndCategorySectionFn } from "../../controllers/ṭemplate-four-controller";
import { reqMultiImageParser, reqSingleImageParser } from "../../../middlewares/multipart-file-parser";
import { productSKUListFn } from "../../controllers/template-six.controller";
import { addProductDropdownFn } from "../../controllers/masters/master.controller";


export default (app: Router) => {

  // banner-Details
    app.post("/template-four/banner",[authorization,reqMultiImageParser(["title_image"])
    ],addBannerSectionFn);
    app.get("/template-four/banner", [authorization],getBannerSectionFn);
    app.put("/template-four/banner/:id",[authorization,reqMultiImageParser(["title_image"])
    ],updateBannerSectionFn);
    app.delete("/template-four/banner/:id", [authorization],deleteBannerSectionFn);
    app.patch("/template-four/banner/:id",[authorization],statusUpdateForBannerSectionFn);
  // banner-Details

  // jewelry-section-Details
    app.put("/template-four/jewelry-section",[authorization,reqMultiImageParser(["title_image"])
    ],addAndUpdatepdateJewelrySectionFn);
    app.get("/template-four/jewelry-section",[authorization],getJewelrySectionFn);
    app.delete("/template-four/jewelry-section/:id",[authorization],deleteJewelrySectionFn);
    app.patch("/template-four/jewelry-section/:id",[authorization],statusUpdateForJewelrySectionFn);
  // jewelry-section-Details

  // perfect-jewelry-Details
    app.put("/template-four/perfect-jewelry",[authorization],addAndUpdatePerfectJewelrySectionFn);
    app.get("/template-four/perfect-jewelry",[authorization],getPerfectJewelrySectionFn);
    app.delete("/template-four/perfect-jewelry/:id",[authorization],deletePerfectJewelrySectionFn);
    app.patch("/template-four/perfect-jewelry/:id",[authorization],statusUpdateForPerfectJewelrySectionFn);
  // perfect-jewelry-Details
        
  // jewellry-categories-Details
    app.post("/template-four/jewellry-categories",[authorization,reqMultiImageParser(["title_image"])
    ],addJewellryCategoriesSectionFn);
    app.put("/template-four/jewellry-categories/:id",[authorization,reqMultiImageParser(["title_image"])],updateJewellryCategoriesSectionFn);
    app.get("/template-four/jewellry-categories",[authorization],getJewellryCategoriesSectionFn);
    app.delete("/template-four/jewellry-categories/:id",[authorization],deleteJewellryCategoriesSectionFn);
    app.patch("/template-four/jewellry-categories/:id",[authorization],statusUpdateForJewellryCategoriesSectionFn);
  // jewellry-categories-Details 

  // new collection

    app.put("/template-four/product-section", [authorization], addUpdateTemplateFourProductsFn )
    app.get("/template-four/product-section/:product_type", [authorization], getALlTemplateFourProductsFn);
  
    app.get("/template-4/product-sku",[authorization], productSKUListFn);
    app.get("/template-4/add-product/dropDown/list",[authorization], addProductDropdownFn);
    
  // new collection

  // latest collection
    app.post("/template-four/latest-collection",[authorization,reqMultiImageParser(["title_image"])
    ],addProductAndCategorySectionFn);
    app.get("/template-four/latest-collection", [authorization],getProductAndCategorySectionFn);
    app.put("/template-four/latest-collection/:id",[authorization,reqMultiImageParser(["title_image"])
    ],updateProductAndCategorySectionFn);
    app.delete("/template-four/latest-collection/:id", [authorization],deleteProductAndCategorySectionFn);
    app.patch("/template-four/latest-collection/:id",[authorization],statusUpdateForProductAndCategorySectionFn);
  // latest collection


  
  // antique collection
    app.post("/template-four/antique",[authorization,reqMultiImageParser(["title_image"])
    ],addAntiqueSectionFn);
    app.get("/template-four/antique", [authorization],getAntiqueSectionFn);
    app.put("/template-four/antique/:id",[authorization,reqMultiImageParser(["title_image"])
    ],updateAntiqueSectionFn);
    app.delete("/template-four/antique/:id", [authorization],deleteAntiqueSectionFn);
    app.patch("/template-four/antique/:id",[authorization],statusUpdateForAntiqueSectionFn);
  // antique collection

   // ancient collection
    app.post("/template-four/ancient",[authorization,reqMultiImageParser(["bg_image","title_image"])
    ],addAncientSectionFn);
    app.get("/template-four/ancient", [authorization],getAncientSectionFn);
    app.put("/template-four/ancient/:id",[authorization,reqMultiImageParser(["bg_image","title_image"])
    ],updateAncientSectionFn);
    app.delete("/template-four/ancient/:id", [authorization],deleteAncientSectionFn);
    app.patch("/template-four/ancient/:id",[authorization],statusUpdateForAncientSectionFn);
  // ancient collection

   // Journal collection
    app.post("/template-four/journal",[authorization,reqMultiImageParser(["bg_image","title_image"])
    ],addJournalSectionFn);
    app.get("/template-four/journal", [authorization],getJournalSectionFn);
    app.put("/template-four/journal/:id",[authorization,reqMultiImageParser(["bg_image","title_image"])
    ],updateJournalSectionFn);
    app.delete("/template-four/journal/:id", [authorization],deleteJournalSectionFn);
    app.patch("/template-four/journal/:id",[authorization],statusUpdateForJournalSectionFn);
  // Journal collection
};
