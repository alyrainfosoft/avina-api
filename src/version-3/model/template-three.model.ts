import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import Image from "./image.model";
import categoryData from "./category.model";
import Collection from "./master/attributes/collection.model";
import SettingTypeData from "./master/attributes/settingType.model";
import DiamondShape from "./master/attributes/diamondShape.model";

const TemplateThreeData = dbContext.define("template_three", {
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
});
TemplateThreeData.hasOne(Image, {
  as: "image",
  foreignKey: "id",
  sourceKey: "id_image",
});
TemplateThreeData.hasOne(Image, {
  as: "hover_image",
  foreignKey: "id",
  sourceKey: "id_hover_image",
});
TemplateThreeData.hasOne(categoryData, {
  as: "category",
  foreignKey: "id",
  sourceKey: "id_category",
});
TemplateThreeData.hasOne(Collection, {
  as: "collection",
  foreignKey: "id",
  sourceKey: "id_collection",
});
TemplateThreeData.hasOne(SettingTypeData, {
  as: "style",
  foreignKey: "id",
  sourceKey: "id_style",
});
TemplateThreeData.hasOne(DiamondShape, {
  as: "diamond_shape",
  foreignKey: "id",
  sourceKey: "id_diamond_shape",
});
export default TemplateThreeData;
