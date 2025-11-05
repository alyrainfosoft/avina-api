import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";

export const LookBook = (dbContext: any) => {
const lookBook = dbContext.define("look_books", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  offer_id: {
    type: INTEGER
  },
  product_id: {
    type: INTEGER
  },
  category_id: {
    type: INTEGER
  },
  collection_id: {
    type: INTEGER
  },
  style_id: {
    type: INTEGER
  },
  event_id: {
    type: INTEGER
  },
  lookbook_id: {
    type: INTEGER
  },
  min_price: {
    type: DOUBLE
  },
  max_price: {
    type: DOUBLE
  },
  is_deleted: {
    type: STRING,
    defaultValue:"0"
  },
  created_by: {
    type: INTEGER,
  },
  created_at: {
    type: DATE,
  },
  updated_by: {
    type: INTEGER,
  },
  updated_at: {
    type: DATE,
  },
  condition:{
    type:STRING
  },
  company_info_id: {
    type: INTEGER,
  }
});

  return lookBook;
}