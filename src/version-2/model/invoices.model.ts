import { DATE, DOUBLE, INTEGER, JSON, SMALLINT, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import Orders from "./order.model";
import OrderTransaction from "./order-transaction.model";

const Invoives = dbContext.define("invoices", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  invoice_number: {
    type: STRING
  },
  invoice_date: {
    type: DATE
  },
  invoice_amount: {
    type: DOUBLE
  },
  billing_address: {
    type: JSON
  },
  shipping_address: {
    type: JSON
  },
  order_id: {
    type: INTEGER
  },
  transaction_id: {
    type: INTEGER
  },
  created_by: {
    type: INTEGER,
  },
  created_date: {
    type: DATE,
  }
});

// Invoives.belongsTo(Orders, {
//     foreignKey: "order_id",
//     as: "order_invoice",
//   });
 

  Invoives.hasOne(Orders, { as: "order_invoice", foreignKey: "id", sourceKey: "order_id" });
  Invoives.hasOne(OrderTransaction, { as: "order_transaction", foreignKey: "id", sourceKey: "transaction_id" });

export default Invoives;
