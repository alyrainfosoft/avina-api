import { BIGINT, DOUBLE, INTEGER, DATE, STRING } from "sequelize";
import { ConfigEternityProduct } from "./config-eternity-product.model";
import { DiamondGroupMaster } from "./master/attributes/diamond-group-master.model";
import { DiamondShape } from "./master/attributes/diamondShape.model";
import { Colors } from "./master/attributes/colors.model";
import { ClarityData } from "./master/attributes/clarity.model";
import { StoneData } from "./master/attributes/gemstones.model";
import { DiamondCaratSize } from "./master/attributes/caratSize.model";
import { CutsData } from "./master/attributes/cuts.model";

export const ConfigEternityProductDiamondDetails = (dbContext) => {
  let configEternityProductDiamondDetails = dbContext.define(
    "config_eternity_product_diamonds",
    {
      id: {
        type: BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      config_eternity_product_id: {
        type: INTEGER,
      },
      dia_count: {
        type: INTEGER,
      },
      dia_cts: {
        type: INTEGER,
      },
      diamond_type: {
        type: DOUBLE,
      },
      created_date: {
        type: DATE,
      },
      created_by: {
        type: INTEGER,
      },
      modified_date: {
        type: DATE,
      },
      modified_by: {
        type: INTEGER,
      },
      id_diamond_group: {
        type: INTEGER,
      },
      dia_weight: {
        type: DOUBLE,
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
    }
  );

  return configEternityProductDiamondDetails;
}
