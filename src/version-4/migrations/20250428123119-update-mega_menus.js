'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "mega_menus" 
      ALTER COLUMN "menu_type" SET  DEFAULT 'header'::menu_type,
      ALTER COLUMN "is_deleted" SET DEFAULT '0'::"bit",
      ALTER COLUMN "is_active" SET DEFAULT '1'::"bit",
       ALTER COLUMN "company_info_id" SET DEFAULT 1,
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
