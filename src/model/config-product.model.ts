import { DATE, DOUBLE, INET, INTEGER, STRING } from "sequelize";
import dbContext from "../config/db-context";
import DiamondGroupMaster from "./master/attributes/diamond-group-master.model";

const ConfigProduct = dbContext.define("config_products", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shank_type_id: {
        type: INTEGER
    },
    side_setting_id: {
        type: INTEGER
    },
    head_type_id: {
        type: INTEGER
    },
    head_no: {
        type: STRING
    },
    shank_no: {
        type: STRING
    },
    ring_no: {
        type: STRING
    },
    render_folder_name: {
        type: STRING
    },
    band_render_upload_date: {
        type: DATE
    },
    render_upload_date: {
        type: DATE
    },
    cad_upload_date: {
        type: DATE
    },
    product_title: {
        type: STRING
    },
    product_sort_des: {
        type: STRING
    },
    product_long_des: {
        type: STRING
    },
    sku: {
        type: STRING
    },
    center_dia_cts: {
        type: DOUBLE
    },
    center_dia_size: {
        type: DOUBLE
    },
    center_dia_shape_id: {
        type: INTEGER
    },
    center_dia_clarity_id: {
        type: INTEGER
    },
    center_dia_cut_id: {
        type: INTEGER
    },
    center_dia_mm_id: {
        type: INTEGER
    },
    center_dia_total_count: {
        type: DOUBLE
    },
    center_dia_total_cts: {
        type: DOUBLE
    },
    prod_dia_total_count: {
        type: DOUBLE
    },
    prod_dia_total_cts: {
        type: DOUBLE
    },
    slug: {
        type: STRING
    },
    center_diamond_group_id: {
        type: INTEGER
    },
    laber_charge: {
        type: DOUBLE
    },
    center_diamond_weigth: {
        type: DOUBLE
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
    is_deleted: {
        type: STRING
    }
  });

  ConfigProduct.hasOne(DiamondGroupMaster, { as: "cender_diamond", foreignKey: "id", sourceKey: "center_diamond_group_id" });



  export default ConfigProduct;