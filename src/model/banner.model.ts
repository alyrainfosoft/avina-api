import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../config/db-context";
import Image from "./image.model";

const Banner = dbContext.define("banners", {
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
  }
});

Banner.hasOne(Image, { as: "image", foreignKey: "id", sourceKey: "id_image" });
export default Banner;
