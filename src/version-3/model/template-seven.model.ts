import { DATE, DOUBLE, INTEGER, JSON, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import Image from "./image.model";
import categoryData from "../../model/category.model";

const TemplateSevenData = dbContext.define("template_seven", {
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
  id_categories:{
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
  product_ids:{
    type:JSON
  }
});

TemplateSevenData.hasOne(Image, {
  as: "bg_image",
  foreignKey: "id",
  sourceKey: "id_bg_image",
});
TemplateSevenData.hasOne(Image, {
  as: "product_image",
  foreignKey: "id",
  sourceKey: "id_product_image",
});
TemplateSevenData.hasOne(Image, {
  as: "title_image",
  foreignKey: "id",
  sourceKey: "id_title_image",
});

TemplateSevenData.hasOne(Image, {
  as: "offer_image",
  foreignKey: "id",
  sourceKey: "id_offer_image",
});

TemplateSevenData.hasOne(categoryData, {
  as: "category",
  foreignKey: "id",
  sourceKey: "id_categories",
});
export default TemplateSevenData;