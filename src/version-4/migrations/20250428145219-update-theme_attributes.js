'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "theme_attributes" 
        ALTER COLUMN "is_deleted" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_deleted" SET NOT NULL,
       ALTER COLUMN "is_changeable" SET DEFAULT '0' ::bit(1),
      ALTER COLUMN "is_changeable" SET NOT NULL;
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
