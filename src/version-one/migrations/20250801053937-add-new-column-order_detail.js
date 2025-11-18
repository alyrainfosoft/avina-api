'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.order_details
    ADD COLUMN offer_details json;
      `)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TABLE IF EXISTS public.order_details DROP COLUMN IF EXISTS offer_details;`
    )
  }
};
