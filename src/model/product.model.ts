import { DATE, INTEGER, NUMBER, STRING } from "sequelize";
import dbContext from "../config/db-context";

const Product = dbContext.define("products", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: STRING,
  },
  sku: {
    type: STRING,
  },
  sort_description: {
    type: STRING,
  },
  long_description: {
    type: STRING,
  },
  tag: {
    type: STRING,
  },
  setting_style_type: {
    type: STRING,
  },
  size: {
    type: STRING,
  },
  length: {
    type: STRING,
  },
  is_active: {
    type: STRING,
  },
  is_deleted: {
    type: STRING,
  },
  making_charge: {
    type: NUMBER,
  },
  finding_charge: {
    type: NUMBER,
  },
  other_charge: {
    type: NUMBER,
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
  is_featured: {
    type: STRING
  },
  is_trending: {
    type: STRING
  },
  slug: {
    type: STRING
  },
  gender: {
    type: STRING
  }
});

export default Product;
