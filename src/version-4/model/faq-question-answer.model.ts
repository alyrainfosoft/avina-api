import { BIGINT, DATE, DOUBLE, INTEGER, STRING, TIME } from "sequelize";

export const FAQData = (dbContext: any) => {
  let FAQDataModel = dbContext.define("faq_que_ans", {
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
    company_info_id: {
      type: INTEGER
    }
  });
  return FAQDataModel;
}
