import { BIGINT, DATE, INTEGER, STRING } from "sequelize";
import {Themes} from "./themes.model";

export const ThemeAttributes = (dbContext: any) => {
  const themeAttributes = dbContext.define("theme_attributes", {
  id: {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  id_theme: {
    type: INTEGER,
  },
  key_value: {
    type: 'character varying',
  },
  value: {
    type: 'character varying',
  },
  link: {
    type: 'character varying',
  },
  id_image: {
    type: INTEGER,
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
  deleted_date: {
    type: DATE
  },
  deleted_by: {
    type: INTEGER
  },
  is_changeable: {
    type: 'bit'
  }
});

  return themeAttributes;
}