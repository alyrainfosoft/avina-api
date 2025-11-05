import { DATE, INTEGER, STRING } from "sequelize";
import { Product } from "./product.model";

export const ProductAttributeValue = (dbContext: any) => {
  let productAttributeValue = dbContext.define("product_attribute_values", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_product: {
      type: STRING,
      references: {
        model: Product,
        key: "id",
      },
    },
    attribute_type: {
      type: STRING,
    },
    id_attribute_value: {
      type: STRING,
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
  return productAttributeValue;
}
