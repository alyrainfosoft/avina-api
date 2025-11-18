import { DATE, DOUBLE, INTEGER, JSON, STRING } from "sequelize";
import {Image} from "./image.model";
export const TemplateTwoBanner = (dbContext:any) => {
  let templateTwoBanner = dbContext.define("template_banners", {
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
    type: INTEGER,
  },
  content: {
    type: STRING,
  },
  button_name: {
    type: STRING,
  },
  sub_title: {
    type: STRING,
  },
  button_two_name: {
    type: STRING,
  },
  target_link_two: {
    type: STRING,
  },
  sort_order: {
    type: DOUBLE,
  },
  banner_text_color: {
    type: STRING,
  },
  company_info_id :{ 
    type:INTEGER
  },
  button_color: {
    type: 'character varying',
  },
  button_text_color: {
    type: 'character varying',
  },
  button_hover_color: {
    type: 'character varying',
  },
  button_hover_text_color: {
    type: 'character varying',
  },
  is_button_transparent: {
    type: 'bit'
  },
  title: {
    type: 'character varying'
  },
  product_ids: {
    type: JSON
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
});
  return templateTwoBanner
};
