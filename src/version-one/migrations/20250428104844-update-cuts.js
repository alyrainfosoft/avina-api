'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "cuts" 

      ALTER COLUMN "is_deleted" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_deleted" SET NOT NULL,

      ALTER COLUMN "is_active" SET DEFAULT '1' ::"bit",
      ALTER COLUMN "is_active" SET NOT NULL,
      
      ALTER COLUMN "is_band" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_three_stone" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_bracelet" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_pendant" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_config" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_earring" SET DEFAULT '0' ::"bit";
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
