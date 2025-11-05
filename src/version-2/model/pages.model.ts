import { BIGINT, DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";

const PageData = dbContext.define("pages", {
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
});

export default PageData;
