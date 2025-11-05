import { DATE, INTEGER } from "sequelize";
import dbContext from "../config/db-context";
import Product from "./product.model";
import AppUser from "./app-user.model";

const ProductWish = dbContext.define("wishlist_products", {
  user_id: {
    type: INTEGER,
    primaryKey: true,
  },
  product_id: {
    type: INTEGER,
    primaryKey: true,
  },
  created_date: {
    type: DATE,
  },

  modified_date: {
    type: DATE,
  },
});

ProductWish.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
  });
  Product.hasMany(ProductWish, {
    foreignKey: "product_id",
    as: "product_wish",
  });

  ProductWish.belongsTo(AppUser, {
    foreignKey: "user_id",
    as: "users",
  });
  AppUser.hasMany(ProductWish, {
    foreignKey: "user_id",
    as: "users_detail",
  });

export default ProductWish;
