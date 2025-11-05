import { DATE, INTEGER, STRING } from "sequelize";
export const Action = (dbContext: any) => {
  let action = dbContext.define("actions", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    action_name: {
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
    company_info_id: {
      type: INTEGER
    }
  });
  return action;
}
