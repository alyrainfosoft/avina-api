import { DATE, DOUBLE, INTEGER, JSON, SMALLINT, STRING } from "sequelize";
import dbContext from "../../../config/db-context";
import giftSetProductOrder from "./gift_set_product_order.model";

const GiftSetProductInvoice = dbContext.define("gift_set_product_invoices", {
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

GiftSetProductInvoice.belongsTo(giftSetProductOrder, {
    foreignKey: "order_id",
    as: "gift_set_order_invoice",
  });
  giftSetProductOrder.hasMany(GiftSetProductInvoice, {
    foreignKey: "order_id",
    as: "gift_set_invoice",
  });

export default GiftSetProductInvoice;
