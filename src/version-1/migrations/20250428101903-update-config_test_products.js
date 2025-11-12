'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "config_test_products"
      ALTER COLUMN "is_deleted" TYPE bit(1)
      USING CASE 
        WHEN "is_deleted" = TRUE THEN B'1'
        ELSE B'0'
      END;
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
