import { BOOLEAN, DATE, INTEGER, JSON, STRING } from "sequelize";
import { Image } from "./image.model";
export const CompanyInfo = (dbContext: any) => {
  let companyInfo = dbContext.define("company_infoes", {
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
    },
    id_header: {
      type: INTEGER
    },
    id_footer: {
      type: INTEGER
    },
    id_home_page: {
      type: INTEGER
    },
    id_product_grid: {
      type: INTEGER
    },
    id_product_card: {
      type: INTEGER
    },
    id_product_filter: {
      type: INTEGER
    },
    id_product_detail: {
      type: INTEGER
    },
    id_create_your_own: {
      type: INTEGER
    },
    id_login_page: {
      type: INTEGER
    },
    id_registration_page: {
      type: INTEGER
    },
    id_toast: {
      type: INTEGER
    },
    id_button: {
      type: INTEGER
    },
    id_cart: {
      type: INTEGER
    },
    id_checkout: {
      type: INTEGER
    },
    loader_image: {
      type: INTEGER
    },
    mail_tem_logo: {
      type: INTEGER
    },
    default_image: {
      type: INTEGER
    },
    page_not_found_image: {
      type: INTEGER
    },
    script: {
      type: 'character varying'
    },
    address_embed_map: {
      type: 'character varying'
    },
    address_map_link: {
      type: 'character varying'
    },
    primary_font: {
      type: 'character varying'
    },
    primary_font_weight: {
      type: 'character varying'
    },
    primary_font_json: {
      type: JSON
    },
    secondary_font: {
      type: 'character varying'
    },
    secondary_font_weight: {
      type: 'character varying'
    },
    secondary_font_json: {
      type: JSON
    },
    secondary_font_type: {
      type: 'character varying'
    },
    primary_font_type: {
      type: 'character varying'
    },
    db_name: {
      type: 'character varying',
    },
    db_user_name: {
      type: 'character varying',
    },
    db_password: {
      type: 'character varying',
    },
    db_host: {
      type: 'character varying',
    },
    db_port: {
      type: INTEGER,
    },
    db_dialect: {
      type: 'character varying',
    },
    db_ssl_unauthorized: {
      type: BOOLEAN,
    },
    is_active: {
      type: 'bit'
    },
    id_profile: {
      type: INTEGER
    },
    share_image: {
      type: INTEGER
    },
    id_configurator: {
      type: 'character varying'
    },
    id_otp_verify: {
      type: INTEGER
    },
    product_not_found_image: {
      type: INTEGER
    },
    order_not_found_image: {
      type: INTEGER
    },
  });
  return companyInfo;
}
