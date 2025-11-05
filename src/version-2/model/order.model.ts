import {
  BIGINT,
  DATE,
  DOUBLE,
  INTEGER,
  JSON,
  SMALLINT,
  STRING,
} from "sequelize";
import dbContext from "../../config/db-context";
import couponData from "./coupon.model";

const Orders = dbContext.define("orders", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    unique: true,
  },
  order_number: {
    type: BIGINT,
  },
  user_id: {
    type: INTEGER,
  },
  shipping_method: {
    type: SMALLINT,
  },
  pickup_store_id: {
    type: INTEGER,
  },
  coupon_id: {
    type: INTEGER,
  },
  sub_total: {
    type: DOUBLE,
  },
  shipping_cost: {
    type: DOUBLE,
  },
  discount: {
    type: DOUBLE,
  },
  total_tax: {
    type: DOUBLE,
  },
  order_total: {
    type: DOUBLE,
  },
  payment_method: {
    type: SMALLINT,
  },
  currency_id: {
    type: INTEGER,
  },
  currency_rate: {
    type: INTEGER,
  },
  order_status: {
    type: SMALLINT,
  },
  payment_status: {
    type: SMALLINT,
  },
  order_date: {
    type: DATE,
  },
  transaction_ref_id: {
    type: INTEGER,
  },
  order_type: {
    type: SMALLINT,
  },
  order_note: {
    type: STRING,
  },
  order_shipping_address: {
    type: JSON,
  },
  order_billing_address: {
    type: JSON,
  },
  order_taxs: {
    type: JSON,
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
  email: {
    type: STRING,
  },
  coupon_discount: {
    type: DOUBLE,
  },
});
Orders.belongsTo(couponData, {
  foreignKey: "coupon_id",
  as: "coupon",
});
export default Orders;
