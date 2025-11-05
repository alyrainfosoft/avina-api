import { DATE, DECIMAL, INTEGER, STRING } from "sequelize";
import { BirthStoneProduct } from "./birth-stone-product.model";

export const BirthstoneProductEngraving = (dbContext: any) => {
  let birthstoneProductEngraving = dbContext.define("birthstone_product_engravings", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_product: {
      type: INTEGER
    },
    text: {
      type: STRING
    },
    max_text_count: {
      type: INTEGER
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
    company_info_id: {
      type: INTEGER
    }
  });

  return birthstoneProductEngraving;
}
