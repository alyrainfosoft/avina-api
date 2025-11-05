import { DATE, DOUBLE, INTEGER, JSON, SMALLINT, STRING } from "sequelize";
import dbContext from "../config/db-context";

const OrderTransaction = dbContext.define("order_transactions", {
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
  }
});

export default OrderTransaction;