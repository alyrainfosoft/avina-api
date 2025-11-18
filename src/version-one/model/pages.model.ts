import { BIGINT, DATE, INTEGER, STRING } from "sequelize";

export const PageData = (dbContext: any) => {
  let pageData = dbContext.define("pages", {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: STRING,
  },
  description: {
    type: STRING,
  },
  url: {
    type: STRING,
  },
  is_active: {
    type: STRING,
  },
  is_restrict: {
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
  company_info_id :{ 
    type:INTEGER
  }
});
  return pageData
};
