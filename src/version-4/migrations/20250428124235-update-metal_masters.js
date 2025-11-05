'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "metal_masters" 
       ALTER COLUMN "is_band" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_three_stone" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_bracelet" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_pendant" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_config" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_earring" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "calculate_rate" SET  DEFAULT 1,
      ALTER COLUMN "is_deleted" SET NOT NULL,
      ALTER COLUMN "is_active" SET NOT NULL;
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
