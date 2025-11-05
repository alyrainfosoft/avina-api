'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "products"
      ALTER COLUMN "is_choose_setting" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_single" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_band" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_3d_product" SET DEFAULT FALSE;
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
