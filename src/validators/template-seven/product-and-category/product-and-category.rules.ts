import { body } from "express-validator";
import { DeletedStatus, TemplateSevenSectionType } from "../../../utils/app-enumeration";
import { NOT_FOUND_MESSAGE, PRODUCT_ID_DUPLICATE_NOT_ALLOW, PRODUCT_ID_MUST_BE_ARRAY, PRODUCT_ID_NOT_FOUND } from "../../../utils/app-messages";
import { prepareMessageFromParams } from "../../../utils/shared-functions";
import { initModels } from "../../../version-1/model/index.model";

export const addProductAndCategoryRules = [
  body("products_and_category").custom(async (value, { req }) => {
    const seenCategories = new Set();
    const {Product, CategoryData} = initModels(req)
    for (const { id_categories, id_products } of value) {
      // Check for duplicate category in request
      if (seenCategories.has(id_categories)) {
        throw new Error(`Duplicate entry for category ID ${id_categories} in request payload`);
      }
      seenCategories.add(id_categories);

      const CategorySection = await CategoryData.findOne({
        where: { id: id_categories, is_deleted: DeletedStatus.No },
      });

      if (!(CategorySection && CategorySection.dataValues)) {
        throw new Error(NOT_FOUND_MESSAGE);
      }

      if (!Array.isArray(id_products) || id_products.length === 0) {
        throw new Error(PRODUCT_ID_MUST_BE_ARRAY);
      }

      const productIdSet = new Set();
      for (const productId of id_products) {
        if (productIdSet.has(productId)) {
          throw new Error(PRODUCT_ID_DUPLICATE_NOT_ALLOW);
        }
        productIdSet.add(productId);

        const productSection = await Product.findOne({
          where: { id: productId, is_deleted: DeletedStatus.No },
        });

        if (!(productSection && productSection.dataValues)) {
          throw new Error(
            prepareMessageFromParams(PRODUCT_ID_NOT_FOUND, [["productId", productId]])
          );
        }
      }
    }

    return true;
  }),
];