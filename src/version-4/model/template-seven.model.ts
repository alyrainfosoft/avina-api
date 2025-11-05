import { DATE, DOUBLE, INTEGER, JSON, STRING } from "sequelize";
import { Image } from "./image.model";
import { CategoryData } from "./category.model";
export const TemplateSevenData = (dbContext: any) => {
  let templateSevenData = dbContext.define("template_seven", {
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
    sub_title_one: {
      type: STRING,
    },
    description: {
      type: STRING,
    },
    sub_description: {
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
    id_categories: {
      type: INTEGER,
    },
    id_products: {
      type: STRING,
    },
    id_bg_image: {
      type: INTEGER,
    },
    id_product_image: {
      type: INTEGER,
    },
    id_title_image: {
      type: INTEGER,
    },
    id_offer_image: {
      type: INTEGER,
    },
    is_active: {
      type: STRING,
    },
    is_deleted: {
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
    },
    product_ids: {
      type: JSON
    }
  });
  return templateSevenData
};