import { DATE, INTEGER, STRING } from "sequelize";
import dbContext from "../../config/db-context";
import Image from "./image.model";

const CompanyInfo = dbContext.define("company_infoes", {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  company_name: {
    type: STRING,
  },
  company_email: {
    type: STRING,
  },
  company_phone: {
    type: STRING,
  },
  copy_right: {
    type: STRING,
  },
  sort_about: {
    type: INTEGER,
  },
  dark_id_image: {
    type: INTEGER,
  },
  light_id_image: {
    type: INTEGER,
  },
  web_link: {
    type: STRING,
  },
  facebook_link: {
    type: STRING,
  },
  insta_link: {
    type: STRING,
  },
  youtube_link: {
    type: STRING,
  },
  linkdln_link: {
    type: STRING,
  },
  twitter_link: {
    type: STRING,
  },
  web_primary_color: {
    type: STRING,
  },
  web_secondary_color: {
    type: STRING,
  },
  announce_is_active: {
    type: STRING,
  },
  announce_color: {
    type: STRING,
  },
  announce_text: {
    type: STRING,
  },
  announce_text_color: {
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
  favicon_image: {
    type: INTEGER,
  },
  key: {
    type: STRING,
  },
  web_restrict_url: {
    type: STRING,
  },
  company_address: {
    type: STRING,
  },
  est_shipping_day: {
    type: INTEGER,
  },
  pinterest_link: {
    type: STRING,
  },
  gst_number: {
    type: STRING
  }
});

CompanyInfo.hasOne(Image, {
  as: "dark_image",
  foreignKey: "id",
  sourceKey: "dark_id_image",
});
CompanyInfo.hasOne(Image, {
  as: "light_image",
  foreignKey: "id",
  sourceKey: "light_id_image",
});
CompanyInfo.hasOne(Image, {
  as: "favicon",
  foreignKey: "id",
  sourceKey: "favicon_image",
});
export default CompanyInfo;
