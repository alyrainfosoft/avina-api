import { BIGINT, DATE, DOUBLE, INTEGER, STRING, TIME } from "sequelize";
import dbContext from "../../config/db-context";

const FAQData = dbContext.define("faq_que_ans", {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  id_parent: {
    type: BIGINT,
  },
  category_name: {
    type: STRING,
  },
  slug: {
    type: STRING,
  },
  question: {
    type: STRING,
  },
  answer: {
    type: STRING,
  },
  is_active: {
    type: STRING,
  },
  is_deleted: {
    type: INTEGER,
  },
  created_date: {
    type: DATE,
    allowNull: false,
  },
  created_by: {
    type: INTEGER,
  },
  modified_date: {
    type: DATE,
  },
  modified_by: {
    type: INTEGER,
  },
  sort_order: {
    type: INTEGER,
  },
});
FAQData.hasOne(FAQData, {
  as: "FAQ_category",
  foreignKey: "id",
  sourceKey: "id_parent",
});
export default FAQData;
