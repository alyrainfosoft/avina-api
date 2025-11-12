import { body } from "express-validator";
import { DeletedStatus } from "../../../utils/app-enumeration";
import { NOT_FOUND_MESSAGE } from "../../../utils/app-messages";
import { resNotFound } from "../../../utils/shared-functions";
import { error } from "console";
import {BlogsData} from "../../../version-1/model/blogs.model";

export const addblogRules:any = [

  // Validate id_products and handle the product array
  body('id_products').custom(async (value) => {
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error('Product IDs should be provided as an array.');
    }

    if(value.length > 5){
      throw new Error('You can added four Blog only not more then that');
    }
    // Check if all products exist and are not deleted
    for (let i = 0; i < value.length; i++) {
      const productId = value[i];
      
      // Assuming you're validating the product IDs
      const productSection = await BlogsData.findOne({
        where: { id: productId, is_deleted: DeletedStatus.No },
      });

      if (!(productSection && productSection.dataValues)) {
        throw new Error(`Blog with ID ${productId} not found.`);
      }
    }

    // Add additional logic if you want to check for "buy one" condition or any other rule
    // For example, you could check if a product is already in another category or not
    // Assuming we have a business rule like "only one product per category" or similar

    const uniqueProducts = new Set(value);
    if (uniqueProducts.size !== value.length) {
      throw new Error('Duplicate blog IDs are not allowed.');
    }

    return true;
  })
  ];

  export const updateblogRules = [


  // Validate id_products and handle the product array
  body('id_products').custom(async (value) => {
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error('Product IDs should be provided as an array.');
    }

    if(value.length > 5){
      throw new Error('You can added four Blog only not more then that');
    }
    // Check if all products exist and are not deleted
    for (let i = 0; i < value.length; i++) {
      const productId = value[i];
      
      // Assuming you're validating the product IDs
      const productSection = await BlogsData.findOne({
        where: { id: productId, is_deleted: DeletedStatus.No },
      });

      if (!(productSection && productSection.dataValues)) {
        throw new Error(`Blog with ID ${productId} not found.`);
      }
    }

    // Add additional logic if you want to check for "buy one" condition or any other rule
    // For example, you could check if a product is already in another category or not
    // Assuming we have a business rule like "only one product per category" or similar

    const uniqueProducts = new Set(value);
    if (uniqueProducts.size !== value.length) {
      throw new Error('Duplicate blog IDs are not allowed.');
    }

    return true;
  })
  ];