import { DATE, DOUBLE, INTEGER, JSON, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import ConfigProduct from "./config-product.model";
import MetalGroupMaster from "./master/attributes/metal/metal-group-master.model";
import MetalMaster from "./master/attributes/metal/metal-master.model";
import GoldKarat from "./master/attributes/metal/gold-karat.model";

const ConfigProductMetals = dbContext.define("config_product_metals", {
  id: {
    type: STRING,
    primaryKey: true,
    autoIncrement: true,
  },
  config_product_id: {
    type: INTEGER,
  },
  metal_id: {
    type: INTEGER,
  },
  karat_id: {
    type: INTEGER,
  },
  metal_tone: {
    type: STRING,
  },
  metal_wt: {
    type: DOUBLE,
  },
  head_shank_band: {
    type: STRING,
  },
  labor_charge: {
    type: DOUBLE,
  },
  created_date: {
    type: DATE,
  },
  created_by: {
    type: INTEGER,
  },
  modified_by: {
    type: INTEGER,
  },
  modified_date: {
    type: DATE,
  },
  is_deleted: {
    type: STRING,
  },
});

ConfigProductMetals.belongsTo(ConfigProduct, {
  foreignKey: "config_product_id",
  as: "config_product",
});
ConfigProduct.hasMany(ConfigProductMetals, {
  foreignKey: "config_product_id",
  as: "CPMO",
});
ConfigProductMetals.belongsTo(MetalMaster, {
  foreignKey: "metal_id",
  as: "metal",
});
MetalMaster.hasOne(ConfigProductMetals, {
  foreignKey: "metal_id",
  as: "metal",
});
ConfigProductMetals.belongsTo(GoldKarat, {
  foreignKey: "karat_id",
  as: "karat",
});
GoldKarat.hasOne(ConfigProductMetals, {
  foreignKey: "karat_id",
  as: "karat",
});
export default ConfigProductMetals;
