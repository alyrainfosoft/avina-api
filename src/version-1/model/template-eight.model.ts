import { DATE, DOUBLE, INTEGER, JSON, STRING, TEXT } from "sequelize";
export const TemplateEightData = (dbContext: any) => {
  let templateEightData = dbContext.define("template_eight", {
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
      type: TEXT,
    },
    sub_description: {
      type: TEXT,
    },
    title_color: {
      type: STRING,
    },
    sub_title_color: {
      type: STRING,
    },
    description_color: {
      type: STRING,
    },
    sub_description_color: {
      type: STRING,
    },
    link: {
      type: STRING,
    },
    button_name: {
      type: STRING,
    },
    button_color: {
      type: STRING,
    },
    button_text_color: {
      type: STRING,
    },
    is_button_transparent: {
      type: STRING,
    },
    button_hover_color: {
      type: STRING,
    },
    button_text_hover_color: {
      type: STRING,
    },
    sort_order: {
      type: DOUBLE,
    },
    id_title_image: {
      type: INTEGER,
    },
    product_ids: {
      type: JSON,
    },
    is_active: {
      type: STRING,
    },
    is_deleted: {
      type: STRING,
    },
    start_date: {
      type: DATE,
    },
    end_date: {
      type: DATE,
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
      type: INTEGER,
    }
  });
  return templateEightData;
};