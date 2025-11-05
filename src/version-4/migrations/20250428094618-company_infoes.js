'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "company_infoes" 
      ALTER COLUMN "is_active" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_active" SET NOT NULL,
      ALTER COLUMN "announce_is_active" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "db_ssl_unauthorized" SET DEFAULT false;
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
