import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../config/db-context";

const Role = dbContext.define("roles", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role_name: {
    type: STRING,
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
});

export default Role;
