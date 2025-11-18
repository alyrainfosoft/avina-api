import { DATE, INTEGER, STRING } from "sequelize";
export const ProductSearchHistories = (dbContext: any) => {
  
let productSearchHistories = dbContext.define("product_search_histories", {
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
  company_info_id :{ 
    type:INTEGER
  }
});
  return productSearchHistories;
}
