import { BIGINT, DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import {DiamondGroupMaster} from "./master/attributes/diamond-group-master.model";
import {SideSettingStyles} from "./master/attributes/side-setting-styles.model";
import {DiamondShape} from "./master/attributes/diamondShape.model";
import {ClarityData} from "./master/attributes/clarity.model";
import {Colors} from "./master/attributes/colors.model";
import {CutsData} from "./master/attributes/cuts.model";

export const ConfigEternityProduct = (dbContext) => {
let configEternityProduct = dbContext.define("config_eternity_products", {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  side_setting_id: {
    type: INTEGER,
  },
  style_no: {
    type: STRING,
  },
  product_title: {
    type: STRING,
  },
  product_sort_des: {
    type: STRING,
  },
  product_long_des: {
    type: STRING,
  },
  sku: {
    type: STRING,
  },
  dia_cts: {
    type: DOUBLE,
  },
  dia_shape_id: {
    type: INTEGER,
  },
  dia_clarity_id: {
    type: INTEGER,
  },
  dia_cut_id: {
    type: INTEGER,
  },
  dia_mm_id: {
    type: INTEGER,
  },
  dia_color: {
    type: INTEGER,
  },
  dia_count: {
    type: DOUBLE,
  },
  diamond_group_id: {
    type: INTEGER,
  },
  prod_dia_total_count: {
    type: DOUBLE,
  },
  alternate_dia_count: {
    type: DOUBLE,
  },
  product_type: {
    type: STRING,
  },
  product_size: {
    type: STRING,
  },
  product_combo_type: {
    type: INTEGER,
  },
  slug: {
    type: STRING,
  },
  created_by: {
    type: INTEGER,
  },
  labour_charge: {
    type: DOUBLE,
  },
  is_deleted: {
    type: STRING,
  },
  other_charge: {
    type: DOUBLE,
  },
  discount_type: {
    type: INTEGER,
  },
  discount_value: {
    type: STRING,
  },
  modified_by: {
    type: INTEGER,
  },
  dia_type: {
    type: INTEGER,
  },
  created_date: {
    type: DATE,
  },
  modified_date: {
    type: DATE,
  },
  id_stone: {
    type: BIGINT,
  },
  company_info_id :{ 
    type:INTEGER
  }
});
  return configEternityProduct
};
