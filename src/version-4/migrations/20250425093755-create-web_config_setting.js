
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('web_config_setting', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      razorpay_public_key: {
  allowNull: true,
  type: 'character varying',
},
      razorpay_secret_key: {
  allowNull: true,
  type: 'character varying',
},
      razorpay_status: {
  default:'0',
  type: 'bit(1)',
},
      razorpay_script: {
  allowNull: true,
  type: 'character varying',
},
      stripe_public_key: {
  allowNull: true,
  type: 'character varying',
},
      stripe_secret_key: {
  allowNull: true,
  type: 'character varying',
},
      stripe_script: {
  allowNull: true,
  type: 'character varying',
},
      stripe_status: {
  default:'0',
  type: 'bit(1)',
},
      paypal_public_key: {
  allowNull: true,
  type: 'character varying',
},
      paypal_secret_key: {
  allowNull: true,
  type: 'character varying',
},
      paypal_script: {
  allowNull: true,
  type: 'character varying',
},
      paypal_status: {
  default:'0',
  type: 'bit(1)',
},
      yoco_public_key: {
  allowNull: true,
  type: 'character varying',
},
      yoco_secret_key: {
  allowNull: true,
  type: 'character varying',
},
      yoco_script: {
  allowNull: true,
  type: 'character varying',
},
      yoco_status: {
  default:'0',      
  type: 'bit(1)',
},
      affirm_public_key: {
  allowNull: true,
  type: 'character varying',
},
      affirm_secret_key: {
  allowNull: true,
  type: 'character varying',
},
      affirm_script: {
  allowNull: true,
  type: 'character varying',
},
      affirm_status: {
  default:'0',
  type: 'bit(1)',
},
      smtp_user_name: {
  allowNull: true,
  type: 'character varying',
},
      smtp_password: {
  allowNull: true,
  type: 'character varying',
},
      smtp_host: {
  allowNull: true,
  type: 'character varying',
},
      smtp_port: {
  allowNull: true,
  type: 'character varying',
},
      smtp_secure: {
  allowNull: true,
  type: 'character varying',
},
      smtp_from: {
  allowNull: true,
  type: 'character varying',
},
      smtp_service: {
  allowNull: true,
  type: 'character varying',
},
      insta_api_endpoint: {
  allowNull: true,
  type: 'character varying',
},
      insta_access_token: {
  allowNull: true,
  type: 'character varying',
},
      image_local_path: {
  allowNull: true,
  type: 'character varying',
},
      file_local_path: {
  allowNull: true,
  type: 'character varying',
},
      local_status: {
  default:'0',
  type: 'bit(1)',
},
      s3_bucket_name: {
  allowNull: true,
  type: 'character varying',
},
      s3_bucket_region: {
  allowNull: true,
  type: 'character varying',
},
      s3_bucket_secret_access_key: {
  allowNull: true,
  type: 'character varying',
},
      s3_bucket_status: {
  default:'0',
  type: 'bit(1)',
},
      image_base_url: {
  allowNull: true,
  type: 'character varying',
},
      three_stone_glb_key: {
  allowNull: true,
  type: 'character varying',
},
      fronted_base_url: {
  allowNull: true,
  type: 'character varying',
},
      reset_pass_url: {
  allowNull: true,
  type: 'character varying',
},
      otp_generate_digit_count: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      invoice_number_generate_digit_count: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      order_invoice_number_identity: {
  allowNull: true,
  type: 'character varying',
},
      allow_out_of_stock_product_order: {
  default:false,
  type: Sequelize.BOOLEAN,
},
      company_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      band_glb_key: {
  allowNull: true,
  type: 'character varying',
},
      glb_key: {
  allowNull: true,
  type: 'character varying',
},
      metal_karat_value: {
  allowNull: true,
  type: Sequelize.TEXT,
},
      metal_gold_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      metal_silver_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      metal_platinum_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      eternity_band_glb_key: {
  allowNull: true,
  type: 'character varying',
},
      bracelet_glb_key: {
  allowNull: true,
  type: 'character varying',
},
      google_font_key: {
  allowNull: true,
  type: 'character varying',
},
      metal_tone_identifier: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      google_auth_status: {
  default:'0',
  type: 'bit(1)',
},
      google_auth_key: {
  allowNull: true,
  type: 'character varying',
},
      insta_auth_status: {
  default:'0',
  type: 'bit(1)',
},
      insta_auth_key: {
  allowNull: true,
  type: 'character varying',
},
      facebook_auth_status: {
  default:'0',
  type: 'bit(1)',
},
      facebook_auth_key: {
  allowNull: true,
  type: 'character varying',
},
      apple_auth_status: {
  default:'0',
  type: 'bit(1)',
},
      apple_auth_key: {
  allowNull: true,
  type: 'character varying',
},
      glb_url: {
  allowNull: true,
  type: 'character varying',
},
      insta_secret_key: {
  allowNull: true,
  type: 'character varying',
},
      gust_user_allowed: {
  default:true,
  type: Sequelize.BOOLEAN,
},
      promo_code_allowed: {
  default:true,
  type: Sequelize.BOOLEAN,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      pickup_from_store: {
  default:true,
  type: Sequelize.BOOLEAN,
},
      move_to_wishlist: {
  default:false,
  type: Sequelize.BOOLEAN,
},
      shop_now: {
  default:false,
  type: Sequelize.BOOLEAN,
},
s3_bucket_access_key: {
  allowNull: true,
  type: 'character varying',
}
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('web_config_setting');
  }
};
