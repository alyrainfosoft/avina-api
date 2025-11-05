import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import { Image } from "./image.model";
import { Collection } from "./master/attributes/collection.model";
import { CategoryData } from "./category.model";
export const TemplateFiveData = (dbContext: any) => {
  let templateFiveData = dbContext.define("template_five", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    section_type: {
      type: STRING,
    },
    title: {
      type: STRING,
    },
    sub_title: {
      type: STRING,
    },
    description: {
      type: STRING,
    },
    button_name: {
      type: STRING,
    },
    button_color: {
      type: STRING,
    },
    link: {
      type: STRING,
    },
    button_text_color: {
      type: STRING,
    },
    sort_order: {
      type: DOUBLE,
    },
    id_category: {
      type: INTEGER,
    },
    id_collection: {
      type: INTEGER,
    },
    title_id_image: {
      type: INTEGER,
    },
    id_image: {
      type: INTEGER,
    },
    id_sub_image: {
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
    company_info_id: {
      type: INTEGER
    }
  });

  return templateFiveData;
}
