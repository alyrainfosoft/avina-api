import { DATE, INTEGER, STRING } from "sequelize";
import { Image } from "../../image.model";

export const SettingTypeData = (dbContext: any) => {
  let settingTypeData = dbContext.define("setting_styles", {
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
    sort_code: {
      type: STRING,
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

  return settingTypeData;
}
