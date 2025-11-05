import { DATE, INTEGER, JSON, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import Product from "./product.model";
import AppUser from "./app-user.model";

const CartProducts = dbContext.define("cart_products", {
  id: {
    type: STRING,
    primaryKey: true
  },
  user_id: {
    type: INTEGER
  },
  product_id: {
    type: INTEGER
  },
  variant_id: {
    type: INTEGER
  },
  quantity: {
    type: INTEGER
  },
  product_details: {
    type: JSON
  },
  product_type: {
    type: INTEGER
  },
  id_metal: {
    type: INTEGER
  },
  id_karat: {
    type: INTEGER
  },
  id_metal_tone: {
    type: INTEGER
  },
  id_size: {
    type: INTEGER
  },
  id_length: {
    type: INTEGER
  },
  is_band: {
    type: INTEGER
  },
  id_head_metal_tone: {
    type: INTEGER
  },
  id_shank_metal_tone: {
    type: INTEGER
  },
  id_band_metal_tone: {
    type: INTEGER
  },
  created_date: {
    type: DATE,
  },
  modified_date: {
    type: DATE,
  },
});

CartProducts.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
Product.hasMany(CartProducts, {
  foreignKey: "product_id",
  as: "product_cart",
});

CartProducts.belongsTo(AppUser, {
  foreignKey: "user_id",
  as: "users",
});
AppUser.hasMany(CartProducts, {
  foreignKey: "user_id",
  as: "users_details",
});

export default CartProducts;
