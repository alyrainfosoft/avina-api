import { BIGINT, DATE, INTEGER, JSON, STRING } from "sequelize";
import { Product } from "./product.model";
import { AppUser } from "./app-user.model";

export const CartProducts = (dbContext: any) => {
  let cartProducts = dbContext.define("cart_products", {
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
    variant_id: {
      type: INTEGER,
    },
    quantity: {
      type: INTEGER,
    },
    product_details: {
      type: JSON,
    },
    product_type: {
      type: INTEGER,
    },
    id_metal: {
      type: INTEGER,
    },
    id_karat: {
      type: INTEGER,
    },
    id_metal_tone: {
      type: INTEGER,
    },
    id_size: {
      type: INTEGER,
    },
    id_length: {
      type: INTEGER,
    },
    is_band: {
      type: INTEGER,
    },
    id_head_metal_tone: {
      type: INTEGER,
    },
    id_shank_metal_tone: {
      type: INTEGER,
    },
    id_band_metal_tone: {
      type: INTEGER,
    },
    created_date: {
      type: DATE,
    },
    modified_date: {
      type: DATE,
    },
    id_coupon: {
      type: BIGINT,
    },
    company_info_id: {
      type: INTEGER
    },
    user_ip: {
      type: 'character varying',
    },
    user_country: {
      type: 'character varying',
    },
    user_location: {
      type: 'character varying',
    }

  });

  return cartProducts;
}
