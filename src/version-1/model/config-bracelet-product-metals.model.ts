import { BIGINT, DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import { ConfigBraceletProduct } from "./config-bracelet-product.model";
import { MetalMaster } from "./master/attributes/metal/metal-master.model";
import { GoldKarat } from "./master/attributes/metal/gold-karat.model";
export const ConfigBraceletProductMetals = (dbContext: any) => {
  let configBraceletProductMetals = dbContext.define(
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
      company_info_id: {
        type: INTEGER
      }
    }
  );
  return configBraceletProductMetals;
}
