'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "template_three"
        -- Change the column type from boolean to bit(1)
        ALTER COLUMN "is_button_transparent" TYPE bit(1)
        USING CASE 
          WHEN "is_button_transparent" = TRUE THEN B'1'::bit(1)
          ELSE B'0'::bit(1)
        END;
    `); 
    await queryInterface.sequelize.query(`
      ALTER TABLE "template_three" 
        ALTER COLUMN "is_deleted" SET DEFAULT '0' ::"bit",
      ALTER COLUMN "is_deleted" SET NOT NULL,
       ALTER COLUMN "is_active" SET DEFAULT '1' ::"bit",
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
