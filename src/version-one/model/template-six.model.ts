import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";
 "../../config/db-context";
import {Image} from "./image.model";
import {Collection} from "./master/attributes/collection.model";
import {SettingTypeData} from "./master/attributes/settingType.model";
import {DiamondShape} from "./master/attributes/diamondShape.model";
import {Product} from "./product.model";
import { CategoryData } from "./category.model";
export const TemplateSixData = (dbContext) => {
  let templateSixData = dbContext.define("template_six", {
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
  id_image: {
    type: INTEGER,
  },
  id_hover_image: {
    type: INTEGER,
  },
  id_title_image: {
    type: INTEGER,
  },
  id_style: {
    type: INTEGER,
  },
  id_category: {
    type: INTEGER,
  },
  id_collection: {
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
  id_diamond_shape: {
    type: INTEGER,
  },
  diamond_shape_type: {
    type: STRING,
  },
  hash_tag: {
    type: STRING,
  },
  id_product: {
    type: INTEGER,
  },
  company_info_id: {
    type: INTEGER
  },
  mobile_banner_image: {
    type: INTEGER
  }
});

  return templateSixData;
};
