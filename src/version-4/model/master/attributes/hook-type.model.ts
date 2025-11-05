import { DATE, INTEGER, JSON, STRING } from "sequelize";
import { Image } from "../../image.model";

export const HookTypeData = (dbContext: any) => {
  let hookTypeData = dbContext.define("hook_types", {
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
    id_image: {
      type: INTEGER,
    },
    is_active: {
      type: STRING,
    },
    created_date: {
      type: DATE,
      allowNull: false,
    },
    modified_date: {
      type: DATE,
    },
    sort_code: {
      type: STRING,
    },
    created_by: {
      type: INTEGER,
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

  return hookTypeData;
}
