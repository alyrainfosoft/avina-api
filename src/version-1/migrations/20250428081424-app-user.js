'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

  // Use raw SQL to define 'bit(1)' for 'is_active' with default value '1'::bit(1)
  await queryInterface.sequelize.query(`
    ALTER TABLE "app_users" 
    ALTER COLUMN "user_status" SET DEFAULT 0;
  `);

    // Use raw SQL to define 'bit(1)' for 'is_active' with default value '1'::bit(1)
   await queryInterface.sequelize.query(`
    ALTER TABLE "app_users" 
    ALTER COLUMN "is_active" SET DEFAULT 0 ::bit(1),
    ALTER COLUMN "is_active" SET NOT NULL;
  `);

   // Repeat for 'is_deleted' and 'is_button_transparent'
   await queryInterface.sequelize.query(`
    ALTER TABLE "app_users" 
    ALTER COLUMN "is_deleted" SET DEFAULT 0 ::bit(1),
    ALTER COLUMN "is_deleted" SET NOT NULL;
  `);

  // Repeat for 'is_deleted' and 'is_button_transparent'
  await queryInterface.sequelize.query(`
    ALTER TABLE "app_users" 
    ALTER COLUMN "is_email_verified" SET DEFAULT 0 ::bit(1);
  `);

  // Use raw SQL to define 'bit(1)' for 'is_active' with default value '1'::bit(1)
  await queryInterface.sequelize.query(`
    ALTER TABLE "app_users" 
    ALTER COLUMN "is_super_admin" SET DEFAULT false;
  `);
  },

  async down (queryInterface, Sequelize) {
  }
};
