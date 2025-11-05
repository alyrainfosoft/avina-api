import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";

const ProductSearchHistories = dbContext.define("product_search_histories", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  value: {
    type: STRING,
  },
  user_id: {
    type: INTEGER,
  },
  created_date: {
    type: DATE,
  },
  modified_date: {
    type: DATE,
  },
});

export default ProductSearchHistories;
