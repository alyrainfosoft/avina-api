'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Use raw SQL to define 'bit(1)' for 'is_active' with default value '1'::bit(1)
   await queryInterface.sequelize.query(`
    ALTER TABLE "birthstone_products" 
    ALTER COLUMN "is_deleted" SET DEFAULT 0 ::bit(1),
    ALTER COLUMN "is_deleted" SET NOT NULL;
  `);
  await queryInterface.sequelize.query(`
    ALTER TABLE "birthstone_products" 
    ALTER COLUMN "is_active" SET DEFAULT 1 ::bit(1),
    ALTER COLUMN "is_active" SET NOT NULL;
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE "birthstone_products" 
    ALTER COLUMN making_charge TYPE DECIMAL(10,3),
    ALTER COLUMN finding_charge TYPE DECIMAL(10,3),
    ALTER COLUMN other_charge TYPE DECIMAL(10,3);
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
