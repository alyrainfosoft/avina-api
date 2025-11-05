import { INTEGER, STRING, DATE, DOUBLE } from "sequelize";
import { CategoryData } from "../../category.model";


export const Collection = (dbContext: any) => {
  let collection = dbContext.define("collections", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: STRING,
      allowNull: false,
    },
    slug: {
      type: STRING,
      allowNull: false,
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
    id_category: {
      type: INTEGER,
    },
    company_info_id: {
      type: INTEGER
    }
  });

  return collection
}
