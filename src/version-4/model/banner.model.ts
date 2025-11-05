import { DATE, INTEGER, JSONB, STRING } from "sequelize";
import { Image } from "./image.model";


export const Banner = (dbContext: any) => {
  let banner = dbContext.define("banners", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: STRING,
    },
    target_url: {
      type: STRING,
    },
    active_date: {
      type: DATE,
    },
    expiry_date: {
      type: DATE,
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
    banner_type: {
      type: INTEGER
    },
    content: {
      type: STRING
    },
    button_name: {
      type: STRING
    },
    company_info_id: {
      type: INTEGER
    },
    description: {
      type: 'character varying'
    },
    sub_title: {
      type: STRING
    }, link_one: {
      type: STRING
    },
    link_two: {
      type: STRING
    },
    button_one: {
      type: STRING
    },
    button_two: {
      type: STRING
    },
    product_ids:{
      type: JSONB,
    },
    title_color: {
      type:STRING
    },
    sub_title_color:{
      type:STRING
    },
    description_color:{
      type:STRING
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
    id_bg_image:{
      type: INTEGER
    }
  });
  return banner;
}
