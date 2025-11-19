import { INTEGER, STRING, DATE } from "sequelize";
export const SieveSizeData = (dbContext: any) => {
  let sieveSizeData = dbContext.define("diamond_seive_sizes", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    value: {
      type: STRING,
      allowNull: false,
    },
    slug: {
      type: STRING,
      allowNull: false,
    },
    sort_code: {
      type: STRING,
    },
    is_active: {
      type: STRING,
      allowNull: false,
    },
    created_date: {
      type: DATE,
      allowNull: false,
    },
    modified_date: {
      type: DATE,
    },
    created_by: {
      type: INTEGER,
      allowNull: false,
    },
    modified_by: {
      type: INTEGER,
    },
    is_deleted: {
      type: STRING,
    },
    company_info_id: {
      type: INTEGER
    }
  });
  return sieveSizeData;
}
