import { BOOLEAN, DATE, DECIMAL, INTEGER, STRING } from "sequelize";
import { DiamondGroupMaster } from "./master/attributes/diamond-group-master.model";
// import SettingCaratWeight from "./master/attributes/settingCaratWeight.model";
import { Product } from "./product.model";
import { SettingTypeData } from "./master/attributes/settingType.model";
import { StoneData } from "./master/attributes/gemstones.model";
import { DiamondShape } from "./master/attributes/diamondShape.model";
import { Colors } from "./master/attributes/colors.model";
import { ClarityData } from "./master/attributes/clarity.model";
import { MMSizeData } from "./master/attributes/mmSize.model";
import { CutsData } from "./master/attributes/cuts.model";
export const ProductDiamondOption = (dbContext: any) => {
  let productDiamondOption = dbContext.define("product_diamond_options", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_product: {
      type: INTEGER,
      references: {
        model: Product(dbContext),
        key: "id",
      },
    },
    id_diamond_group: {
      type: INTEGER,
      references: {
        model: DiamondGroupMaster(dbContext),
        key: "id",
      },
    },
    id_type: {
      type: INTEGER,
    },
    id_setting: {
      type: INTEGER,
      references: {
        model: SettingTypeData(dbContext),
        key: "id",
      },
    },
    weight: {
      type: DECIMAL,
    },
    count: {
      type: INTEGER,
    },
    is_default: {
      type: STRING,
    },
    is_deleted: {
      type: STRING,
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
    id_stone: {
      type: INTEGER,
    },
    id_shape: {
      type: INTEGER,
    },
    id_color: {
      type: INTEGER,
    },
    id_clarity: {
      type: INTEGER,
    },
    id_mm_size: {
      type: INTEGER,
    },
    id_cut: {
      type: INTEGER,
    },
    company_info_id: {
      type: INTEGER
    },
    is_band: {
      type: BOOLEAN
    }
  });

  return productDiamondOption;
}
