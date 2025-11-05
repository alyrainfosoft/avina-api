import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../config/db-context";
import DiamondShape from "./master/attributes/diamondShape.model";
import Product from "./product.model";

const ProductAttributeValue = dbContext.define("product_attribute_values", {
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
});

ProductAttributeValue.belongsTo(Product, { foreignKey: "id_product" });
Product.hasMany(ProductAttributeValue, { foreignKey: "id_product", as: 'PAV' });

export default ProductAttributeValue;
