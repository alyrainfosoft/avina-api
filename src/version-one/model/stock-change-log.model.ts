import { DATE, INTEGER, SMALLINT, STRING } from "sequelize";
export const StockChangeLog = (dbContext: any) => {
  let stockChangeLog = dbContext.define("stock_change_logs", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: INTEGER,
  },
  variant_id: {
    type: INTEGER,
  },
  product_type: {
    type: SMALLINT,
  },
  sku: {
    type: STRING,
  },
  prev_quantity: {
    type: INTEGER,
  },
  new_quantity: {
    type: INTEGER,
  },
  transaction_type: {
    type: SMALLINT,
  },
  changed_by: {
    type: INTEGER,
  },
  email: {
    type: STRING,
  },
  change_date: {
    type: DATE,
  },
   company_info_id :{ 
      type:INTEGER
    }
});

  return stockChangeLog;
}
