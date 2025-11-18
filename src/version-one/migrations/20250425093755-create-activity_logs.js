
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
// Define the custom ENUM type in PostgreSQL
await queryInterface.sequelize.query(`CREATE TYPE public.log_type AS ENUM('metal_master', 'metal_karat', 'product', 'diamond_group_master', 'order', 'template_seven_luminous_design', 'banner', 'featureSection', 'marketing_popup', 'Marketing_bennar', 'our_story', 'address', 'enquiry', 'product_enquiry', 'metal_ton', 'brand', 'diamond_carat_size', 'clarity', 'collection', 'color', 'cut', 'diamond_shape', 'gem_stone', 'head', 'hook_type', 'item_length', 'item_size', 'mm_size', 'sieve_size', 'setting_carat_weight', 'setting_type', 'shank', 'side_setting', 'tag', 'city', 'country', 'currency', 'master', 'page', 'state', 'tax', 'temaplete_two_banner', 'temaplete_two_feature_section', 'temaplete_two_home_about_banner', 'temaplete_two_home_about_feature', 'temaplete_two_home_about_marketing', 'temaplete_two_home_about_marketing_popup', 'temaplete_two_home_marketing_section', 'temaplet_five_banner', 'temaplet_five_category', 'temaplet_five_diamond', 'temaplet_five_jewellry', 'temaplet_five_product_modle', 'template_six_banner', 'template_six_diamon_shape', 'template_six_instagram', 'template_six_shape_marque', 'template_six_Shop_by', 'temaplate_Six_sparkling', 'temaplate_three_diamondshape', 'temaplate_three_shopeby', 'temaplate_three_splash_screen', 'template_seven_offers_slider', 'template_seven_single_offer_top', 'template_seven_single_offer_bottom', 'template_seven_attractive_jewelry', 'template_seven_jewelry_Categories', 'template_seven_stunning_desgin', 'template_seven_festive_sale_offer', 'template_seven_dazzling_and_stylish', 'template_seven_category_and_products', 'template_seven_stunning_jewels', 'template_seven_testimonial', 'template_seven_testimonial_detail', 'template_seven_new_and_blog', 'about_us', 'all_product_cart', 'auth', 'birth_stone_product', 'birth_stone_product_upload', 'blog_category', 'blog', 'cart_product', 'category', 'companyinfo', 'config_all_product_bulk_upload', 'config_bracelet_product_bulk_upload', 'config_eternity_product_bulk_upload', 'config_product_bulk_upload_new', 'config_product_bulk_upload', 'config_product_New_diamond_group_bulk_upload', 'coupon', 'customer', 'genral_enquiry', 'faq', 'faq_que_aws', 'gift_set_product', 'gift_set_product_image', 'home_about_main', 'home_about_sub_content', 'info_section', 'loose_diamond_bulk_import', 'loose_diamond_bulk_import_image', 'mega_menu', 'meta_data', 'payment_transaction', 'gift_set_payment_transaction', 'config_payment_transaction', 'config_payment_transaction_with_paypal', 'product_bulk_upload_with_choose_setting', 'product_bulk_upload_with_variant', 'product_bulk_upload', 'product_image_bulk_upload', 'product_review', 'product_wish_list', 'variant_product_wish_list', 'product_wish_list_with_product', 'move_product_cart_to_wish_list', 'retail_discount_config_product_bulk_upload', 'role_api_permission', 'role', 'role_configuration', 'menu_item', 'shipping_charge', 'static_page', 'subscription', 'testimonials', 'themes', 'web_config', 'theme_compony_info', 'tp_diamond', 'upload', 'user_management', 'webhook', 'menu_item_with_permission', 'stripe_transaction', 'razor_pay', 'webhook_transaction_success', 'webhook_transaction_failed', 'client_manage', 'pay_pal', 'stripe', 'configurator_setting', 'temaplete_two_product_section', 'mega_menu_acttributes', 'store_address', 'order_with_paypal', 'filter', 'email_template');`);

// Define the custom ENUM type in PostgreSQL
await queryInterface.sequelize.query(`
CREATE TYPE public.log_activity_type AS ENUM
    ('ADD', 'EDIT', 'DELETE', 'STATUS_UPDATE', 'RATE_UPDATE', 'QUANTITY_UPDATE', 'REGISTER', 'LOGIN', 'OTP', 'REFRESH_TOKEN', 'CHANGE_PASSWORD', 'FORGOT_PASSWORD', 'RESETPASSWORD', 'CHANGE_ANY_USER_PASSWORD', 'CUSTOMER_REGISTER', 'CUSTOMER_REGISTER_WITH_SYSTEM', 'CUSTOMER_REGISTER_WITH_GOOGLE', 'All_READY_EXIST_CUSTOMER_REGISTER_WITH_GOOGLE', 'CUSTOMER__OTP_VARIFICATION', 'RESEND_OTP_VERIFICATION', 'CUSTOMER_INFO_UPDATE', 'IS_FEATURED', 'IS_TRANDING', 'BLOG_DEFAULT', 'COMPANY_INFO_UPDATE', 'REMOVE_COUPON', 'ORDER_STATUS', 'DELIVERY_STATUS', 'SUBSCRIBE', 'LOGO_UPDATE', 'SCRIPT', 'UPDATE_FONT_STYLE', 'DELETE_FONT_STYLE', 'UPDATE_SYSTEM_COLOR', 'STRIPE_EVENT', 'PAYPAL_EVENT', 'RAZORPAY_EVENT', 'FAILED_PAYMENT_QUENTITY_MANAGE_METAL', 'FAILED_PAYMENT_QUENTITY_MANAGE_DIAMOND', 'CUSTOMER_LOGIN', 'CUSTOMER_OTP');
`);

await queryInterface.createTable('activity_logs', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      log_type: {
  allowNull: true,
  type: 'log_type'},
      activity_type: {
  allowNull: true,
  type: 'log_activity_type'
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      old_value_json: {
  allowNull: true,
  type: Sequelize.JSON,
},
      updated_value_json: {
  allowNull: true,
  type: Sequelize.JSON,
},
      ref_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('activity_logs');
     // Drop the custom type in PostgreSQL
     await queryInterface.sequelize.query(`
      DROP TYPE about_us_section_type;
    `);
  }
};
