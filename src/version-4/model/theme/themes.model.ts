import { DATE, INTEGER, STRING } from "sequelize";
import { Image } from "../image.model";
export const Themes = (dbContext: any) => {
  let themes = dbContext.define("themes", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: 'character varying',
    },
    name: {
      type: 'character varying',
    },
    section_type: {
      type: STRING,
    },
    description: {
      type: STRING,
    },
    id_image: {
      type: INTEGER,
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
    deleted_date: {
      type: DATE
    },
    deleted_by: {
      type: INTEGER
    }
  });
  return themes;
}