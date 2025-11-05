import { BIGINT, DATE, INTEGER, JSON, STRING } from "sequelize";
import { SizeData } from "./master/attributes/item-size.model";
import { LengthData } from "./master/attributes/item-length.model";
import { MetalMaster } from "./master/attributes/metal/metal-master.model";
import { GoldKarat } from "./master/attributes/metal/gold-karat.model";
import { MetalTone } from "./master/attributes/metal/metalTone.model";
import { CustomerUser } from "./customer-user.model";
export const ProductWish = (dbContext: any) => {
  let productWish = dbContext.define("wishlist_products", {
    id: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: INTEGER,
    },
    product_id: {
      type: INTEGER,
    },
    created_date: {
      type: DATE,
    },
    product_type: {
      type: INTEGER,
    },
    variant_id: {
      type: INTEGER,
    },
    id_size: {
      type: INTEGER,
    },
    id_length: {
      type: INTEGER,
    },
    id_metal_tone: {
      type: INTEGER,
    },
    id_head_metal_tone: {
      type: INTEGER,
    },
    id_shank_metal_tone: {
      type: INTEGER,
    },
    is_band: {
      type: STRING,
    },
    id_band_metal_tone: {
      type: INTEGER,
    },
    id_metal: {
      type: INTEGER,
    },
    id_karat: {
      type: INTEGER,
    },
    product_details: {
      type: JSON,
    },
    modified_date: {
      type: DATE,
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
  return productWish;
}
