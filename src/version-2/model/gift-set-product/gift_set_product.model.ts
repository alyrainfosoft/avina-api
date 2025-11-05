import { DATE, DOUBLE, INTEGER, NUMBER, STRING } from "sequelize";
import dbContext from "../../../config/db-context";
import BrandData from "../master/attributes/brands.model";

const GiftSetProduct = dbContext.define("gift_set_products", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_title: {
    type: STRING,
  },
  sku: {
    type: STRING,
  },
  short_des: {
    type: STRING,
  },
  long_des: {
    type: STRING,
  },
  tags: {
    type: STRING,
  },
  price: {
    type: DOUBLE
  },
  is_active: {
    type: STRING,
  },
  is_deleted: {
    type: STRING,
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
  slug: {
    type: STRING
  },
  gender: {
    type: STRING
  },
  brand_id: {
    type: INTEGER
  }
});

GiftSetProduct.hasOne(BrandData, { as: "brands", foreignKey: "id", sourceKey: "brand_id" });

export default GiftSetProduct;
