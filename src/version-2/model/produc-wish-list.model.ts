import { BIGINT, DATE, INTEGER, JSON, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import Product from "./product.model";
import AppUser from "./app-user.model";
import SizeData from "./master/attributes/item-size.model";
import LengthData from "./master/attributes/item-length.model";
import MetalMaster from "./master/attributes/metal/metal-master.model";
import GoldKarat from "./master/attributes/metal/gold-karat.model";
import MetalTone from "./master/attributes/metal/metalTone.model";
import customerUser from "./customer-user.model";

const ProductWish = dbContext.define("wishlist_products", {
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
});

ProductWish.hasOne(SizeData, {
  as: "size",
  foreignKey: "id",
  sourceKey: "id_size",
});
ProductWish.hasOne(LengthData, {
  as: "length",
  foreignKey: "id",
  sourceKey: "id_length",
});
ProductWish.hasOne(MetalMaster, {
  as: "metal",
  foreignKey: "id",
  sourceKey: "id_metal",
});
ProductWish.hasOne(GoldKarat, {
  as: "karat",
  foreignKey: "id",
  sourceKey: "id_karat",
});
ProductWish.hasOne(MetalTone, {
  as: "metal_tone",
  foreignKey: "id",
  sourceKey: "id_metal_tone",
});
ProductWish.hasOne(MetalTone, {
  as: "head_metal_tone",
  foreignKey: "id",
  sourceKey: "id_head_metal_tone",
});
ProductWish.hasOne(MetalTone, {
  as: "shank_metal_tone",
  foreignKey: "id",
  sourceKey: "id_shank_metal_tone",
});
ProductWish.hasOne(MetalTone, {
  as: "band_metal_tone",
  foreignKey: "id",
  sourceKey: "id_band_metal_tone",
});
ProductWish.hasOne(customerUser, {
  as: "user",
  foreignKey: "id_app_user",
  sourceKey: "user_id",
});

export default ProductWish;
