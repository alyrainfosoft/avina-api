import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import categoryData from "./category.model";
import Product from "./product.model";

const ProductCategory = dbContext.define("product_categories", {
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
});

ProductCategory.belongsTo(Product, {
  foreignKey: "id_product",
  as: "product",
});

Product.hasMany(ProductCategory, {
  foreignKey: "id_product",
  as: "product_categories",
});

ProductCategory.belongsTo(categoryData, {
  foreignKey: "id_category",
  as: "category",
});

ProductCategory.belongsTo(categoryData, {
  foreignKey: "id_sub_category",
  as: "sub_category",
});

ProductCategory.belongsTo(categoryData, {
  foreignKey: "id_sub_sub_category",
  as: "sub_sub_category",
});

export default ProductCategory;
