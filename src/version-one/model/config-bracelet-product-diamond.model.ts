import { BIGINT, DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import { ConfigBraceletProduct } from "./config-bracelet-product.model";
import { DiamondGroupMaster } from "./master/attributes/diamond-group-master.model";
import { DiamondShape } from "./master/attributes/diamondShape.model";
import { Colors } from "./master/attributes/colors.model";
import { ClarityData } from "./master/attributes/clarity.model";
import { StoneData } from "./master/attributes/gemstones.model";
import { CutsData } from "./master/attributes/cuts.model";
import { DiamondCaratSize } from "./master/attributes/caratSize.model";
import { MMSizeData } from "./master/attributes/mmSize.model";

export const ConfigBraceletProductDiamonds = (dbContext: any) => {
  let configBraceletProductDiamonds = dbContext.define(
    "config_bracelet_product_diamonds",
    {
      id: {
        type: BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      config_product_id: {
        type: INTEGER,
      },
      stone_type: {
        type: STRING,
      },
      id_stone: {
        type: INTEGER,
      },
      id_shape: {
        type: INTEGER,
      },
      id_mm_size: {
        type: INTEGER,
      },
      id_color: {
        type: INTEGER,
      },
      id_clarity: {
        type: INTEGER,
      },
      id_cut: {
        type: INTEGER,
      },
      id_carat: {
        type: INTEGER,
      },
      dia_wt: {
        type: DOUBLE,
      },
      dia_count: {
        type: INTEGER,
      },
      id_diamond_group_master: {
        type: INTEGER,
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
      alternate_stone: {
        type: STRING,
      },
      company_info_id: {
        type: INTEGER
      }
    }
  );

  return configBraceletProductDiamonds;
}
