import { DATE, DOUBLE, INTEGER, JSON, SMALLINT, STRING } from "sequelize";

export const OrderTransaction = (dbContext: any) => { 
  
let orderTransaction = dbContext.define("order_transactions", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: INTEGER,
  },
  order_amount: {
    type: DOUBLE,
  },
  payment_status: {
    type: INTEGER,
  },
  payment_currency: {
    type: STRING
  },
  payment_datetime: {
    type: DATE
  },
  payment_source_type: {
    type: STRING
  },
  payment_json: {
    type: JSON
  },
  payment_transaction_id: {
    type: STRING,
  },
  created_by: {
    type: INTEGER,
  },
  created_date: {
    type: DATE,
  },
  company_info_id :{ 
    type:INTEGER
  }
});
  return orderTransaction;
}