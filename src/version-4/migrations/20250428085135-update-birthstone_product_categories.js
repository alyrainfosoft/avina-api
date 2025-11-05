'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     // Use raw SQL to define 'bit(1)' for 'is_active' with default value '1'::bit(1)
     await queryInterface.sequelize.query(`
      ALTER TABLE "birthstone_product_categories" 
      ALTER COLUMN "is_deleted" SET DEFAULT 0 ::bit(1),
      ALTER COLUMN "is_deleted" SET NOT NULL;
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
