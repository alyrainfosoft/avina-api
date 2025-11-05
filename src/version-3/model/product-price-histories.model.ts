import { DATE, DECIMAL, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";

const ProductPriceHistories = dbContext.define("product_price_histories", {
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
});

export default ProductPriceHistories;
