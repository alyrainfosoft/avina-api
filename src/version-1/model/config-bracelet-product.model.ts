import { BIGINT, DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import { SideSettingStyles } from "./master/attributes/side-setting-styles.model";
import { HookTypeData } from "./master/attributes/hook-type.model";
import { LengthData } from "./master/attributes/item-length.model";
import { DiamondCaratSize } from "./master/attributes/caratSize.model";


export const ConfigBraceletProduct = (dbContext) => {
  let configBraceletProduct = dbContext.define("config_bracelet_products", {
    id: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    product_type: {
      type: STRING,
    },
    product_style: {
      type: STRING,
    },
    product_length: {
      type: INTEGER,
    },
    setting_type: {
      type: INTEGER,
    },
    hook_type: {
      type: INTEGER,
    },
    dia_total_wt: {
      type: DOUBLE,
    },
    style_no: {
      type: STRING,
    },
    bracelet_no: {
      type: STRING,
    },
    is_active: {
      type: STRING,
    },
    is_deleted: {
      type: STRING,
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
    product_title: {
      type: STRING,
    },
    sku: {
      type: STRING,
    },
    slug: {
      type: STRING,
    },
    product_sort_des: {
      type: STRING,
    },
    product_long_des: {
      type: STRING,
    },
    product_dia_type: {
      type: INTEGER,
    },
    metal_weight_type: {
      type: STRING,
    },
    company_info_id: {
      type: INTEGER
    }
  });

  return configBraceletProduct;
}
