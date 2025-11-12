'use strict';

const { json } = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
     const value = await queryInterface.sequelize.query(`SELECT * FROM company_infoes`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) { 
       await queryInterface.bulkInsert('company_infoes', [
  {
    "id": 1,
    "company_name": "Tech Core",
    "company_email": "info@thecadco.com",
    "company_phone": "9324970538",
    "copy_right": "© COPYRIGHT 2015 - 2024 , THE CAD CO. ALL RIGHTS RESERVED.",
    "sort_about": "Discover the world of timeless elegance and quality craftsmanship at The Cadco. Your story, our passion.\r\nStay in touch with Royale Jewelers for the latest updates, promotions, and exclusive offers. Follow us on social media for a daily dose of inspiration and elegance. we're here to make your jewelery experience truly exceptional.",
    "dark_id_image": null,
    "light_id_image": null,
    "web_link": "https://development.d2iczjnxoxlxbe.amplifyapp.com/",
    "facebook_link": "https://www.facebook.com/thecadco",
    "insta_link": "https://www.instagram.com/thecadco/",
    "youtube_link": "https://www.youtube.com",
    "linkdln_link": "https://www.linkedin.com/authwall?trk=gf&trkInfo=AQFyPsW0LIA3qAAAAYhXsIBINmlkA-Bp6FL0NT6M6ZSAIDkndBhX-FiCth4xzur42JI3mitlJ949aPT28iQVeuQTaFeKNY4Uzrz6WcYMp_ZbC-2CzKUi5RbmyvoxDPqX5iFg1KY=&original_referer=https://www.thecadco.com/&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Fthe-cad-co%2F",
    "twitter_link": "https://twitter.com/thecadco",
    "web_primary_color": "#23093c",
    "web_secondary_color": "#f5f3ff",
    "announce_is_active": "0",
    "announce_color": "#51c8c6",
    "announce_text": "Welcome to The Cad Co at Mumbai Jewelry Show",
    "created_by": 1,
    "created_date": new Date(),
    "modified_by": 1,
    "modified_date": null,
    "announce_text_color": "#6b6666",
    "key": "TCC_TECH",
    "favicon_image": null,
    "web_restrict_url": null,
    "company_address": "C-202, Orchid Plaza, Cinema, Ramkunwar Thakur Marg, near Movie Time, Maratha Colony, Dahisar East, Mumbai, Maharashtra 400068",
    "est_shipping_day": 3,
    "pinterest_link": "https://www.pinterest.com",
    "gst_number": "-",
    "id_header": null,
    "id_footer": null,
    "id_home_page": null,
    "id_product_grid": null,
    "id_product_card": null,
    "id_product_filter": null,
    "id_product_detail": null,
    "id_create_your_own": null,
    "id_login_page": null,
    "id_registration_page": null,
    "id_toast": null,
    "id_button": null,
    "id_cart": null,
    "id_checkout": null,
    "loader_image": null,
    "mail_tem_logo": null,
    "default_image": null,
    "page_not_found_image": null,
    "script": "<script src='myscripts.js'></script>",
    "address_embed_map": "https://www.google.com/maps/place/The+CAD+Co./@19.251861,72.862966,17z/data=!4m6!3m5!1s0x3be7b1657804c347:0x400dae8d4cef1efc!8m2!3d19.2518911!4d72.8628805!16s%2Fg%2F11vdjngyds?hl=en&entry=ttu&g_ep=EgoyMDI1MDMxOS4yIKXMDSoASAFQAw%3D%3D",
    "address_map_link": "https://www.google.com/maps/place/The+CAD+Co./@19.251861,72.862966,17z/data=!4m6!3m5!1s0x3be7b1657804c347:0x400dae8d4cef1efc!8m2!3d19.2518911!4d72.8628805!16s%2Fg%2F11vdjngyds?hl=en&entry=ttu&g_ep=EgoyMDI1MDMxOS4yIKXMDSoASAFQAw%3D%3D",
    "primary_font": "Josefin Sans",
    "primary_font_weight": "400",
    "primary_font_json": JSON.stringify({
      "link": "https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap"
    }),
    "secondary_font": "Agu Display",
    "secondary_font_weight": "400",
    "secondary_font_json": JSON.stringify({
      "link": "https://fonts.gstatic.com/s/agudisplay/v1/iJWXBXKbbi6BeMC1_RX7qF_V5E7aciGRRWUwX4ftka9LM6y8Zg.ttf"
    }),
    "secondary_font_type": "google",
    "primary_font_type": "google",
    "is_active": "1",
    "db_name": queryInterface.sequelize.config.database,
    "db_user_name": queryInterface.sequelize.config.username,
    "db_password": queryInterface.sequelize.config.password,
    "db_host": queryInterface.sequelize.config.host,
    "db_port": queryInterface.sequelize.config.port,
    "db_dialect": queryInterface.sequelize.config.username,
    "db_ssl_unauthorized": queryInterface.sequelize.config.ssl == undefined ? false: true,
    "id_profile": null,
    "share_image": null,
    "product_not_found_image": null,
    "order_not_found_image": null,
    "id_configurator": "1,2,3,4,5",
    "id_otp_verify": null,
    "id_config_detail": null
  }
]);
    }
   
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('company_infoes', null, {});
  }
};
