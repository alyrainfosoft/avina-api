'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "web_config_setting" 
        ALTER COLUMN "razorpay_status" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "razorpay_status" SET NOT NULL,
      
       ALTER COLUMN "stripe_status" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "stripe_status" SET NOT NULL,

    ALTER COLUMN "paypal_status" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "paypal_status" SET NOT NULL,

      ALTER COLUMN "affirm_status" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "affirm_status" SET NOT NULL,

      ALTER COLUMN "local_status" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "local_status" SET NOT NULL,

      ALTER COLUMN "yoco_status" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "yoco_status" SET NOT NULL,

      ALTER COLUMN "allow_out_of_stock_product_order" SET DEFAULT false,
      ALTER COLUMN "allow_out_of_stock_product_order" SET NOT NULL,

       ALTER COLUMN "s3_bucket_status" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "s3_bucket_status" SET NOT NULL,

       ALTER COLUMN "google_auth_status" SET DEFAULT '0' ::"bit",

       ALTER COLUMN "insta_auth_status" SET DEFAULT '0' ::"bit",

       ALTER COLUMN "facebook_auth_status" SET DEFAULT '0' ::"bit",

       ALTER COLUMN "apple_auth_status" SET DEFAULT '0' ::"bit",

      ALTER COLUMN "gust_user_allowed" SET DEFAULT true,

      ALTER COLUMN "promo_code_allowed" SET DEFAULT true,

      ALTER COLUMN "pickup_from_store" SET DEFAULT true,

      ALTER COLUMN "move_to_wishlist" SET DEFAULT false,

      ALTER COLUMN "shop_now" SET DEFAULT false;



    `);  
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
