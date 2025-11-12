'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    // Altering the column `action_name` to have a maximum length of 30
    await queryInterface.sequelize.query(`
      ALTER TABLE actions
      ALTER COLUMN action_name TYPE character varying(30) COLLATE pg_catalog."default";
    `);

   // Use raw SQL to define 'bit(1)' for 'is_active' with default value '1'::bit(1)
   await queryInterface.sequelize.query(`
    ALTER TABLE "actions" 
    ALTER COLUMN "is_active" TYPE bit(1) USING "is_active"::bit(1),
    ALTER COLUMN "is_active" SET DEFAULT 0 ::bit(1),
    ALTER COLUMN "is_active" SET NOT NULL;
  `);

   // Repeat for 'is_deleted' and 'is_button_transparent'
   await queryInterface.sequelize.query(`
    ALTER TABLE "actions" 
    ALTER COLUMN "is_deleted" TYPE bit(1) USING "is_deleted"::bit(1),
    ALTER COLUMN "is_deleted" SET DEFAULT 0 ::bit(1),
    ALTER COLUMN "is_deleted" SET NOT NULL;
  `);
  },

  async down (queryInterface, Sequelize) {
     // Revert the changes made in the 'up' function using raw SQL
     await queryInterface.sequelize.query(`
      ALTER TABLE "actions" 
      ALTER COLUMN "is_active" DROP DEFAULT,
      ALTER COLUMN "is_active" DROP NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "actions" 
      ALTER COLUMN "is_deleted" DROP DEFAULT,
      ALTER COLUMN "is_deleted" DROP NOT NULL;
    `);
  }
};
