'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.sequelize.query(`
      ALTER TABLE "product_diamond_options" 
        ALTER COLUMN "is_deleted" SET DEFAULT 0::bit(1),
      ALTER COLUMN "is_deleted" SET NOT NULL,
       ALTER COLUMN "is_default" SET DEFAULT 0::bit(1),
      ALTER COLUMN "is_default" SET NOT NULL,
       ALTER COLUMN "is_band" SET DEFAULT false;
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
