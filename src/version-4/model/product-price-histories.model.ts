import { DATE, DECIMAL, INTEGER, STRING } from "sequelize";

export const ProductPriceHistories = (dbContext: any) => {
  let productPriceHistories = dbContext.define("product_price_histories", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_product: {
      type: INTEGER,
    },
    id_option: {
      type: INTEGER,
    },
    option_type: {
      type: INTEGER,
    },
    old_price: {
      type: DECIMAL,
    },
    new_price: {
      type: DECIMAL,
    },
    price_changed_date: {
      type: DATE,
    },
    changed_by: {
      type: INTEGER,
    },
    company_info_id: {
      type: INTEGER
    }
  });

  return productPriceHistories;
}
