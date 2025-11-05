import { DATE, INTEGER, JSON, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import Product from "./product.model";
import AppUser from "./app-user.model";
import ConfigProduct from "../model/config-product.model";
import Image from "./image.model";

const ConfigCartProduct = dbContext.define("config_cart_products", {
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
  product_SKU: {
    type: INTEGER
  },
  quantity: {
    type: INTEGER
  },
  product_details: {
    type: JSON
  },
  id_image: {
    type: INTEGER
  },
  created_date: {
    type: DATE,
  },
  modified_date: {
    type: DATE,
  },
});

ConfigCartProduct.hasOne(Image, { as: "image", foreignKey: "id", sourceKey: "id_image" });

ConfigCartProduct.belongsTo(ConfigProduct, {
  foreignKey: "product_id",
  as: "config_product",
});
ConfigProduct.hasMany(ConfigCartProduct, {
  foreignKey: "product_id",
  as: "config_product_cart",
});

ConfigCartProduct.belongsTo(AppUser, {
  foreignKey: "user_id",
  as: "user",
});
AppUser.hasMany(ConfigCartProduct, {
  foreignKey: "user_id",
  as: "user_detail",
});

export default ConfigCartProduct;
