import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import dbContext from "../config/db-context";
import Image from "./image.model";
import ConfigProduct from "./config-product.model";


const ConfigProductDiamonds = dbContext.define("config_product_diamonds", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    config_product_id: {
        type: INTEGER,
    },
    product_type: {
        type:STRING,
    },
    dia_cts_individual: {
        type:INTEGER,
    },
    dia_count: {
        type: INTEGER,
    },
    dia_cts: {
        type: INTEGER,
    },
    dia_size: {
        type: INTEGER,
    },
    id_diamond_group: {
        type: INTEGER
    },
    dia_weight: {
        type: DOUBLE
    },
    created_date: {
        type: DATE,
    },
    modified_date: {
        type: DATE,
    },
    created_by: {
        type: INTEGER,
        allowNull: false
    },
    modified_by: {
        type: INTEGER,
    }

});

ConfigProductDiamonds.belongsTo(ConfigProduct, {
    foreignKey: "config_product_id",
    as: "config_product",
  });
  ConfigProduct.hasMany(ConfigProductDiamonds, {
    foreignKey: "config_product_id",
    as: "CPDO",
  });

export default ConfigProductDiamonds