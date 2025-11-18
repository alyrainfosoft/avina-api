
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
     // Create an ENUM type
     await queryInterface.sequelize.query(`
CREATE TYPE public.font_type AS ENUM
    ('google', 'font');    `);

    await queryInterface.createTable('company_infoes', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      company_name: {
  allowNull: false,
  type: 'character varying',
},
      company_email: {
  allowNull: true,
  type: 'character varying',
},
      company_phone: {
  allowNull: true,
  type: 'character varying',
},
      copy_right: {
  allowNull: true,
  type: 'character varying',
},
      sort_about: {
  allowNull: true,
  type: 'character varying',
},
      dark_id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      light_id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      web_link: {
  allowNull: true,
  type: 'character varying',
},
      facebook_link: {
  allowNull: true,
  type: 'character varying',
},
      insta_link: {
  allowNull: true,
  type: 'character varying',
},
      youtube_link: {
  allowNull: true,
  type: 'character varying',
},
      linkdln_link: {
  allowNull: true,
  type: 'character varying',
},
      twitter_link: {
  allowNull: true,
  type: 'character varying',
},
      web_primary_color: {
  allowNull: true,
  type: 'character varying',
},
      web_secondary_color: {
  allowNull: true,
  type: 'character varying',
},
      announce_is_active: {
  allowNull: true,default:'0',
  type: 'bit(1)',
},
      announce_color: {
  allowNull: true,
  type: 'character varying',
},
      announce_text: {
  allowNull: true,
  type: 'character varying',
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      announce_text_color: {
  allowNull: true,
  type: 'character varying',
},
      key: {
  allowNull: true,
  type: 'character varying',
},
      favicon_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      web_restrict_url: {
  allowNull: true,
  type: 'character varying',
},
      company_address: {
  allowNull: true,
  type: 'character varying',
},
      est_shipping_day: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      pinterest_link: {
  allowNull: true,
  type: 'character varying',
},
      gst_number: {
  allowNull: true,
  type: 'character varying',
},
      id_header: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_footer: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_home_page: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_product_grid: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_product_card: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_product_filter: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_product_detail: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_create_your_own: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_login_page: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_registration_page: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_toast: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_button: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_cart: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_checkout: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      loader_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      mail_tem_logo: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      default_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      page_not_found_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      script: {
  allowNull: true,
  type: 'character varying',
},
      address_embed_map: {
  allowNull: true,
  type: 'character varying',
},
      address_map_link: {
  allowNull: true,
  type: 'character varying',
},
      primary_font: {
  allowNull: true,
  type: 'character varying',
},
      primary_font_weight: {
  allowNull: true,
  type: 'character varying',
},
      primary_font_json: {
  allowNull: true,
  type: Sequelize.JSON,
},
      secondary_font: {
  allowNull: true,
  type: 'character varying',
},
      secondary_font_weight: {
  allowNull: true,
  type: 'character varying',
},
      secondary_font_json: {
  allowNull: true,
  type: Sequelize.JSON,
},
      secondary_font_type: {
  allowNull: true,
  type: 'font_type',
},
      primary_font_type: {
  allowNull: true,
  type: 'font_type',
},
     is_active: {
  default:'1',
  type: 'bit(1)',
},
      db_name: {
  allowNull: true,
  type: 'character varying',
},
      db_user_name: {
  allowNull: true,
  type: 'character varying',
},
      db_password: {
  allowNull: true,
  type: 'character varying',
},
      db_host: {
  allowNull: true,
  type: 'character varying',
},
      db_port: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      db_dialect: {
  allowNull: true,
  type: 'character varying',
},
      db_ssl_unauthorized: {
  allowNull: false,
  default:false,
  type: Sequelize.BOOLEAN,
},
      id_profile: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      share_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},

  id_configurator:{
    allowNull: true,
    type: 'character varying',
  }
,
      id_otp_verify: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_config_detail: {
  allowNull: true,
  type: Sequelize.INTEGER,
},

product_not_found_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
order_not_found_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('company_infoes');
    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE font_type;
    `);
  }
};
