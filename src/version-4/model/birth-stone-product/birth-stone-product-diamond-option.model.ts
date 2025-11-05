import { DATE, DECIMAL, INTEGER, STRING } from "sequelize";
import { BirthStoneProduct } from "./birth-stone-product.model";
import { DiamondGroupMaster } from "../master/attributes/diamond-group-master.model";

export const BirthStoneProductDiamondOption = (dbContext: any) => {
  let birthStoneProductDiamondOption = dbContext.define("birthstone_product_diamond_options", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_product: {
      type: INTEGER,
      references: {
        model: BirthStoneProduct(dbContext),
        key: "id",
      },
    },
    id_diamond_group: {
      type: INTEGER,
      references: {
        model: DiamondGroupMaster,
        key: "id",
      },
    },
    id_type: {
      type: INTEGER,
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
      type: INTEGER
    },
    id_shape: {
      type: INTEGER
    },
    id_clarity: {
      type: INTEGER
    },
    id_carat: {
      type: INTEGER
    },
    id_mm_size: {
      type: INTEGER
    },
    id_color: {
      type: INTEGER
    },
    id_cut: {
      type: INTEGER
    },
    company_info_id: {
      type: INTEGER
    }
  });
  return birthStoneProductDiamondOption;
}
