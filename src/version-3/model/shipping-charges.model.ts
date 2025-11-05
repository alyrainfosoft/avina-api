import { DATE, DOUBLE, INTEGER, NOW, STRING } from "sequelize";
import dbContext from "../../config/db-context";

const ShippingCharge = dbContext.define(
  "shipping_charges",
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    amount: {
      type: DOUBLE,
      allowNull: false,
    },
    is_active: {
      type: STRING(1),
      allowNull: false,
    },
    is_deleted: {
      type: STRING(1),
      allowNull: true,
      defaultValue: "0",
    },
    min_amount: {
      type: DOUBLE,
    },
    max_amount: {
      type: DOUBLE,
    },
    created_date: {
      type: DATE,
      allowNull: false,
      defaultValue: NOW,
    },
    created_by: {
      type: INTEGER,
      allowNull: true,
    },
    modified_date: {
      type: DATE,
      allowNull: false,
      defaultValue: NOW,
    },
    modified_by: {
      type: INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

export default ShippingCharge;
