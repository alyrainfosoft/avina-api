import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import ConfigEternityProduct from "./config-eternity-product.model";
import MetalMaster from "./master/attributes/metal/metal-master.model";
import GoldKarat from "./master/attributes/metal/gold-karat.model";

const ConfigEternityProductMetalDetail = dbContext.define(
  "config_eternity_product_metals",
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    config_eternity_id: {
      type: INTEGER,
    },
    metal_id: {
      type: INTEGER,
    },
    metal_wt: {
      type: DOUBLE,
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
    karat_id: {
      type: INTEGER,
    },
    metal_tone: {
      type: STRING,
    },
    labour_charge: {
      type: DOUBLE,
    },
    is_deleted: {
      type: STRING,
    },
  }
);

ConfigEternityProduct.hasOne(ConfigEternityProductMetalDetail, {
  foreignKey: "config_eternity_id",
  as: "metal",
});

ConfigEternityProductMetalDetail.belongsTo(ConfigEternityProduct, {
  foreignKey: "config_eternity_id",
  as: "metal",
});

ConfigEternityProductMetalDetail.belongsTo(MetalMaster, {
  foreignKey: "metal_id",
  as: "MetalMaster",
});

ConfigEternityProductMetalDetail.belongsTo(GoldKarat, {
  foreignKey: "karat_id",
  as: "KaratMaster",
});

export default ConfigEternityProductMetalDetail;
