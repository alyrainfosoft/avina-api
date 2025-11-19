'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.stock_change_logs
    ALTER COLUMN prev_quantity SET DEFAULT 0;
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
