'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "template_banners" 
        ALTER COLUMN "is_deleted" SET DEFAULT 0 ::bit(1),
      ALTER COLUMN "is_deleted" SET NOT NULL,
       ALTER COLUMN "is_active" SET DEFAULT 0 ::bit(1),
      ALTER COLUMN "is_active" SET NOT NULL,
 ALTER COLUMN "is_button_transparent" SET DEFAULT '0' ::"bit";
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
