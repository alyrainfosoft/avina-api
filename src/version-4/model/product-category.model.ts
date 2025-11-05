import { DATE, INTEGER, STRING } from "sequelize";
import { CategoryData } from "./category.model";
import { Product } from "./product.model";

export let ProductCategory = (dbContext: any) => {

  let productCategory = dbContext.define("product_categories", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_product: {
      type: INTEGER,
    },
    id_category: {
      type: INTEGER,
    },
    id_sub_category: {
      type: INTEGER,
    },
    id_sub_sub_category: {
      type: INTEGER,
    },
    is_deleted: {
      type: STRING,
    },
    created_by: {
      type: INTEGER,
    },
    created_date: {
      type: DATE,
    },
    modified_by: {
      type: INTEGER,
    },
    modified_date: {
      type: DATE,
    },
    company_info_id: {
      type: INTEGER
    }
  });

  return productCategory;
}
