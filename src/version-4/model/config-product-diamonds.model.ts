import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import { ConfigProduct } from "./config-product.model";
import { DiamondGroupMaster } from "./master/attributes/diamond-group-master.model";
import { DiamondShape } from "./master/attributes/diamondShape.model";
import { Colors } from "./master/attributes/colors.model";
import { ClarityData } from "./master/attributes/clarity.model";
import { StoneData } from "./master/attributes/gemstones.model";
import { CutsData } from "./master/attributes/cuts.model";
import { MMSizeData } from "./master/attributes/mmSize.model";

export const ConfigProductDiamonds = (dbContext: any) => {
  let configProductDiamonds = dbContext.define("config_product_diamonds", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    config_product_id: {
      type: INTEGER,
    },
    product_type: {
      type: STRING,
    },
    dia_cts_individual: {
      type: INTEGER,
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
      type: INTEGER,
    },
    dia_weight: {
      type: DOUBLE,
    },
    created_date: {
      type: DATE,
    },
    modified_date: {
      type: DATE,
    },
    created_by: {
      type: INTEGER,
      allowNull: false,
    },
    modified_by: {
      type: INTEGER,
    },
    dia_shape: {
      type: INTEGER,
    },
    dia_stone: {
      type: INTEGER,
    },
    dia_color: {
      type: INTEGER,
    },
    dia_mm_size: {
      type: INTEGER,
    },
    dia_clarity: {
      type: INTEGER,
    },
    dia_cuts: {
      type: INTEGER,
    },
    is_deleted: {
      type: STRING,
    },
    company_info_id: {
      type: INTEGER
    }
  });

  return configProductDiamonds;
}
