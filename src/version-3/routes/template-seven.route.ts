import { Router } from "express";
import { authorization } from "../../middlewares/authenticate";
import { addAndUpdateAttractiveJewellrySectionFn, addAndUpdateDazzlingAndStylishSectionFn, addAndUpdatepdateTestimonialsSectionFn, addAndUpdateStunningDesignSectionFn, addBlogSectionFn, addFestiveSaleOfferSectionFn, addJewellryCategorisSectionFn, addLominousDesignSectionFn, addOffersBottomSectionFn, addOffersSliderSectionFn, addOffersTopSectionFn, addProductAndCategorySectionFn, addStunningJewelrySectionFn, addTemplateSevenPoductsFn, addTestimonialsDetailsSectionFn, deleteAttractiveJewellrySectionFn, deleteBlogSectionFn, deleteDazzlingAndStylishSectionFn, deleteFestiveSaleOfferSectionFn, deleteJewellryCategorisSectionFn, deleteOffersBottomSectionFn, deleteOffersSliderSectionFn, deleteOffersTopSectionFn, deleteProductAndCategorySectionFn, deleteStunningDesignSectionFn, deleteStunningJewelrySectionFn, deleteTestimoninalsSectionFn, getALlTemplateSevenProductsFn, getAttractiveJewellrySectionFn, getBlogSectionFn, getDazzlingAndStylishSectionFn, getFestiveSaleOfferSectionFn, getJewellryCategorisSectionFn, getLominousDesignSectionFn, getOffersBottomSectionFn, getOffersSliderSectionFn, getOffersTopSectionFn, getProductAndCategorySectionFn, getStunningDesignSectionFn, getStunningJewelrySectionFn, getTestimonialsDetailsSectionFn, getTestimonialsSectionFn, statusUpdateForAttractiveJewellryFn, statusUpdateForBlogSectionFn, statusUpdateForDazzlingAndStylishFn, statusUpdateForFestiveSaleOfferFn, statusUpdateForJewellryCategoriesFn, statusUpdateForLominousDesignSectionFn, statusUpdateForOffersBottomSectionFn, statusUpdateForOffersSliderSectionFn, statusUpdateForOffersTopSectionFn, statusUpdateForProductAndCategorySectionFn, statusUpdateForStunningDesignFn, statusUpdateForStunningJewelrySectionFn, statusUpdateForTestimonialDetailSectionFn, statusUpdateForTestimonialsSectionFn, templateSevensAllSectionDetailForUserFn, templateSevensAllSectionListForUserFn, updateBlogSectionFn, updateFestiveSaleOfferSectionFn, updateJewellryCategorisSectionFn, updateLominousDesignSectionFn, updateOffersBottomSectionFn, updateOffersSliderSectionFn, updateOffersTopSectionFn, updateStunningJewelrySectionFn, updateTemplateSevenProductsFn, updateTestimonialDetailSectionFn } from "../controllers/template-seven.controller";
import { reqArrayImageParser, reqMultiImageParser, reqSingleImageParser } from "../../middlewares/multipart-file-parser";
import { addJewellryCategoriesValidator, updateJewellryCategoriesValidator } from "../../validators/template-seven/jewellry-categories/jewellry-categories.validator";
import { addPoductAndCategoryValidator } from "../../validators/template-seven/product-and-category/product-and-category.validator";

import { addBlogValidator, updateBlogValidator } from "../../validators/template-seven/blog/blog.validator";
export default (app: Router) => {

  // OffersSlider
  app.post("/template-seven/offer-slider",[authorization,reqArrayImageParser(["bg_image"])
  ],addOffersSliderSectionFn);
  app.get("/template-seven/offer-slider", [authorization],getOffersSliderSectionFn);
  app.put("/template-seven/offer-slider/:id",[authorization,reqArrayImageParser(["bg_image"])
  ],updateOffersSliderSectionFn);
  app.delete("/template-seven/offer-slider/:id", [authorization],deleteOffersSliderSectionFn);
  app.patch("/template-seven/offer-slider/:id",[authorization],statusUpdateForOffersSliderSectionFn);
  // OffersSlider

   // OffersTop
   app.post("/template-seven/offer-top",[authorization,reqArrayImageParser(["bg_image"])
  ],addOffersTopSectionFn);
  app.get("/template-seven/offer-top", [authorization],getOffersTopSectionFn);
  app.put("/template-seven/offer-top/:id",[authorization,reqArrayImageParser(["bg_image"])
  ],updateOffersTopSectionFn);
  app.delete("/template-seven/offer-top/:id", [authorization],deleteOffersTopSectionFn);
  app.patch("/template-seven/offer-top/:id",[authorization],statusUpdateForOffersTopSectionFn);
  // OffersTop

   // OffersBottom
   app.post("/template-seven/offer-bottom",[authorization,reqArrayImageParser(["bg_image"])
  ],addOffersBottomSectionFn);
  app.get("/template-seven/offer-bottom", [authorization],getOffersBottomSectionFn);
  app.put("/template-seven/offer-bottom/:id",[authorization,reqArrayImageParser(["bg_image"])
  ],updateOffersBottomSectionFn);
  app.delete("/template-seven/offer-bottom/:id", [authorization],deleteOffersBottomSectionFn);
  app.patch("/template-seven/offer-bottom/:id",[authorization],statusUpdateForOffersBottomSectionFn);
  // OffersBottom

  
   // attractive-jewellery

  app.get("/template-seven/attractive-jewellery", [authorization],getAttractiveJewellrySectionFn);
  app.post("/template-seven/attractive-jewellery",[authorization
  ],addAndUpdateAttractiveJewellrySectionFn);
  app.delete("/template-seven/attractive-jewellery/:id", [authorization],deleteAttractiveJewellrySectionFn
  );
  app.patch("/template-seven/attractive-jewellery/:id",[authorization],statusUpdateForAttractiveJewellryFn);
  // attractive-jewellery

    // jewellery-calegories
    app.post("/template-seven/jewellery-calegories",[authorization,reqArrayImageParser(["title_image"]),addJewellryCategoriesValidator
    ],addJewellryCategorisSectionFn);
    app.get("/template-seven/jewellery-calegories", [authorization],getJewellryCategorisSectionFn);
    app.put("/template-seven/jewellery-calegories/:id",[authorization,reqArrayImageParser(["title_image"]),updateJewellryCategoriesValidator
    ],updateJewellryCategorisSectionFn);
    app.delete("/template-seven/jewellery-calegories/:id", [authorization],deleteJewellryCategorisSectionFn
  
    );
    app.patch("/template-seven/jewellery-calegories/:id",[authorization],statusUpdateForJewellryCategoriesFn);
    // jewellery-calegories
    
       // stunning-design
   app.get("/template-seven/stunning-design", [authorization],getStunningDesignSectionFn);
   app.post("/template-seven/stunning-design",[authorization
   ],addAndUpdateStunningDesignSectionFn);
   app.delete("/template-seven/stunning-design/:id", [authorization],deleteStunningDesignSectionFn
 
   );
   app.patch("/template-seven/stunning-design/:id",[authorization],statusUpdateForStunningDesignFn);
   // stunning-design

    // festive-sale-offers
    app.post("/template-seven/festive-sale-offer",[authorization,reqMultiImageParser(["bg_image","product_image","title_image","offer_image"])
    ],addFestiveSaleOfferSectionFn);
    app.get("/template-seven/festive-sale-offer", [authorization],getFestiveSaleOfferSectionFn);
    app.put("/template-seven/festive-sale-offer/:id",[authorization,reqMultiImageParser(["bg_image","product_image","title_image","offer_image"])
    ],updateFestiveSaleOfferSectionFn);
    app.delete("/template-seven/festive-sale-offer/:id", [authorization],deleteFestiveSaleOfferSectionFn
  
    );
    app.patch("/template-seven/festive-sale-offer/:id",[authorization],statusUpdateForFestiveSaleOfferFn);
    // festive-sale-offers

     // dazzling-and-stylish
     app.post("/template-seven/dazzling-and-stylish",[authorization
    ],addAndUpdateDazzlingAndStylishSectionFn);
    app.get("/template-seven/dazzling-and-stylish", [authorization],getDazzlingAndStylishSectionFn);
    app.delete("/template-seven/dazzling-and-stylish/:id", [authorization],deleteDazzlingAndStylishSectionFn
  
    );
    app.patch("/template-seven/dazzling-and-stylish/:id",[authorization],statusUpdateForDazzlingAndStylishFn);
    // dazzling-and-stylish
  
    // dproduct-and-category
    app.post("/template-seven/product-and-category",[authorization,addPoductAndCategoryValidator
    ],addProductAndCategorySectionFn);
    app.get("/template-seven/product-and-category", [authorization],getProductAndCategorySectionFn);
    app.delete("/template-seven/product-and-category/:id", [authorization],deleteProductAndCategorySectionFn
  
    );
    app.patch("/template-seven/product-and-category/:id",[authorization],statusUpdateForProductAndCategorySectionFn);
    // dproduct-and-category

    // stunning-jewelry
    app.post("/template-seven/stunning-jewelry",[authorization,reqMultiImageParser(["bg_image","product_image","title_image"])
    ],addStunningJewelrySectionFn);
    app.get("/template-seven/stunning-jewelry", [authorization],getStunningJewelrySectionFn);
    app.put("/template-seven/stunning-jewelry/:id",[authorization,reqMultiImageParser(["bg_image","product_image","title_image"])
    ],updateStunningJewelrySectionFn);
    app.delete("/template-seven/stunning-jewelry/:id", [authorization],deleteStunningJewelrySectionFn
  
    );
    app.patch("/template-seven/stunning-jewelry/:id",[authorization],statusUpdateForStunningJewelrySectionFn);
    // stunning-jewelry

    
    // lominous-design
    app.post("/template-seven/lominous-design",[authorization,reqArrayImageParser(["title_image"])
    ],addLominousDesignSectionFn);
    app.get("/template-seven/lominous-design", [authorization],getLominousDesignSectionFn);
    app.put("/template-seven/lominous-design/:id",[authorization,reqArrayImageParser(["title_image"])
    ],updateLominousDesignSectionFn);
    app.delete("/template-seven/lominous-design/:id", [authorization],deleteJewellryCategorisSectionFn
  
    );
    app.patch("/template-seven/lominous-design/:id",[authorization],statusUpdateForLominousDesignSectionFn);
    // lominous-design

     // testimonials
   app.post("/template-seven/testimonials",[authorization,reqArrayImageParser(["title_image"])
  ],addAndUpdatepdateTestimonialsSectionFn);
  app.get("/template-seven/testimonials", [authorization],getTestimonialsSectionFn);
  
  app.delete("/template-seven/testimonials/:id", [authorization],deleteTestimoninalsSectionFn);
  app.patch("/template-seven/testimonials/:id",[authorization],statusUpdateForTestimonialsSectionFn);
  // testimonials

   // testimonials-Details
   app.post("/template-seven/testimonials-details",[authorization
  ],addTestimonialsDetailsSectionFn);
  app.get("/template-seven/testimonials-details", [authorization],getTestimonialsDetailsSectionFn);
  app.put("/template-seven/testimonials-details/:id",[authorization
  ],updateTestimonialDetailSectionFn);
  app.delete("/template-seven/testimonials-details/:id", [authorization],deleteTestimoninalsSectionFn);
  app.patch("/template-seven/testimonials-details/:id",[authorization],statusUpdateForTestimonialDetailSectionFn);
  // testimonial-Details

  // blog
  app.post("/template-seven/blog",[authorization,addBlogValidator
  ],addBlogSectionFn);
  app.get("/template-seven/blog", [authorization],getBlogSectionFn);
  app.put("/template-seven/blog/:id",[authorization,updateBlogValidator
  ],updateBlogSectionFn);
  app.delete("/template-seven/blog/:id", [authorization],deleteBlogSectionFn);
  app.patch("/template-seven/blog/:id",[authorization],statusUpdateForBlogSectionFn);
  // blog

  // user side
  app.get("/template-seven/user",templateSevensAllSectionListForUserFn);
  app.get("/template-seven/user/:id",templateSevensAllSectionDetailForUserFn);
  //user side

     // product
     app.post("/template-seven/product",[authorization,reqSingleImageParser("image")
     ],addTemplateSevenPoductsFn);
     app.get("/template-seven/product/:section_type", [authorization],getALlTemplateSevenProductsFn);
     app.put("/template-seven/product/:id",[authorization,reqSingleImageParser("image")
     ],updateTemplateSevenProductsFn);
     app.get("/template-seven/product", [authorization],getALlTemplateSevenProductsFn);
   
    // product
}