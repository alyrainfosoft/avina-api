import { DATE, DOUBLE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import Image from "./image.model";

const AboutUsData = dbContext.define("about_us", {
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
    content: {
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
    }
  });
  AboutUsData.hasOne(Image, {
    as: "image",
    foreignKey: "id",
    sourceKey: "id_image",
  });
export default AboutUsData