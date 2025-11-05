import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../../config/db-context";
import BirthStoneProduct from "./birth-stone-product.model";
import categoryData from "../category.model";


const BirthstoneProductCategory = dbContext.define("birthstone_product_categories", {
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

BirthstoneProductCategory.belongsTo(BirthStoneProduct, {
  foreignKey: "id_product",
  as: "product",
});

BirthStoneProduct.hasMany(BirthstoneProductCategory, {
  foreignKey: "id_product",
  as: "birth_stone_product_categories",
});

BirthstoneProductCategory.belongsTo(categoryData, {
  foreignKey: "id_category",
  as: "category",
});

BirthstoneProductCategory.belongsTo(categoryData, {
  foreignKey: "id_sub_category",
  as: "sub_category",
});

BirthstoneProductCategory.belongsTo(categoryData, {
  foreignKey: "id_sub_sub_category",
  as: "sub_sub_category",
});

export default BirthstoneProductCategory;
