import { BIGINT, DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import ConfigBraceletProduct from "./config-bracelet-product.model";
import MetalMaster from "./master/attributes/metal/metal-master.model";
import GoldKarat from "./master/attributes/metal/gold-karat.model";

const ConfigBraceletProductMetals = dbContext.define(
  "config_bracelet_product_metals",
  {
    id: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    config_product_id: {
      type: INTEGER,
    },
    id_metal: {
      type: INTEGER,
    },
    id_karat: {
      type: INTEGER,
    },
    labour_charge: {
      type: DOUBLE,
    },
    metal_wt: {
      type: DOUBLE,
    },
    created_date: {
      type: DATE,
    },
    modified_date: {
      type: DATE,
    },
    created_by: {
      type: STRING,
    },
    modified_by: {
      type: STRING,
    },
  }
);
ConfigBraceletProduct.hasOne(ConfigBraceletProductMetals, {
  foreignKey: "config_product_id",
  as: "config_product_metal_details",
});

ConfigBraceletProductMetals.belongsTo(ConfigBraceletProduct, {
  foreignKey: "config_product_id",
  as: "config_product_metal_details",
});

ConfigBraceletProductMetals.belongsTo(MetalMaster, {
  foreignKey: "id_metal",
  as: "metal_detail",
});

ConfigBraceletProductMetals.belongsTo(GoldKarat, {
  foreignKey: "id_karat",
  as: "karat_detail",
});
export default ConfigBraceletProductMetals;
