import { DATE, INTEGER, JSON, STRING } from "sequelize";
import { AppUser } from "./app-user.model";
import { ConfigProduct } from "./config-product.model";
import { Image } from "./image.model";
export const ConfigCartProduct = (dbContext: any) => {
  let configCartProduct = dbContext.define("config_cart_products", {
    id: {
      type: STRING,
      primaryKey: true,
    },
    user_id: {
      type: INTEGER,
    },
    product_id: {
      type: INTEGER,
    },
    product_SKU: {
      type: INTEGER,
    },
    quantity: {
      type: INTEGER,
    },
    product_details: {
      type: JSON,
    },
    id_image: {
      type: INTEGER,
    },
    created_date: {
      type: DATE,
    },
    modified_date: {
      type: DATE,
    },
    company_info_id: {
      type: INTEGER
    }
  });

  configCartProduct.hasOne(Image(dbContext), {
    as: "image",
    foreignKey: "id",
    sourceKey: "id_image",
  });
  return configCartProduct;
}
