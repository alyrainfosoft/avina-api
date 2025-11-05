'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.subscriptions
    ADD COLUMN user_ip character varying;
    `); 

    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.subscriptions
    ADD COLUMN user_country character varying;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.subscriptions
    ADD COLUMN user_location character varying;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN user_ip character varying;
    `); 

    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN user_country character varying;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN user_location character varying;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN user_ip character varying;
    `); 

    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN user_country character varying;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN user_location character varying;
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
