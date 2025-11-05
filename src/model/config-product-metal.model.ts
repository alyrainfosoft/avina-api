import { DATE, DOUBLE, INTEGER, JSON, STRING } from "sequelize";
import dbContext from "../config/db-context";
import ConfigProduct from "./config-product.model";


const ConfigProductMetals = dbContext.define("config_product_metals", {
  id: {
    type: STRING,
    primaryKey: true,
    autoIncrement: true
  },
  config_product_id: {
    type: INTEGER
  },
  metal_id: {
    type: INTEGER
  },
  karat_id: {
    type: INTEGER
  },
  metal_tone: {
    type: STRING
  },
  metal_wt: {
    type: DOUBLE
  },
  head_shank_band: {
    type: STRING
  },
  created_date: {
    type: DATE,
  },
  created_by: {
    type: INTEGER
  },
  modified_by: {
    type: INTEGER
  },
  modified_date: {
    type: DATE,
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


export default ConfigProductMetals;
