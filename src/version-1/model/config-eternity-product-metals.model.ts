import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import { MetalMaster } from "./master/attributes/metal/metal-master.model";
import { GoldKarat } from "./master/attributes/metal/gold-karat.model";
import { ConfigEternityProduct } from "./config-eternity-product.model";
export const ConfigEternityProductMetalDetail = (dbContext: any) => {
  let configEternityProductMetalDetail = dbContext.define(
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
      company_info_id: {
        type: INTEGER
      }
    }
  );
  return configEternityProductMetalDetail
};
