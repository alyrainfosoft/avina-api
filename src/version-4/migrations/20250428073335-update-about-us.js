'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Use raw SQL to define 'bit(1)' for 'is_active' with default value '1'::bit(1)
    await queryInterface.sequelize.query(`
      ALTER TABLE "about_us" 
      ALTER COLUMN "is_active" TYPE bit(1) USING "is_active"::bit(1),
      ALTER COLUMN "is_active" SET DEFAULT '1'::bit(1),
      ALTER COLUMN "is_active" SET NOT NULL;
    `);

    // Repeat for 'is_deleted' and 'is_button_transparent'
    await queryInterface.sequelize.query(`
      ALTER TABLE "about_us" 
      ALTER COLUMN "is_deleted" TYPE bit(1) USING "is_deleted"::bit(1),
      ALTER COLUMN "is_deleted" SET DEFAULT '0'::bit(1),
      ALTER COLUMN "is_deleted" SET NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "about_us" 
      ALTER COLUMN "is_button_transparent" TYPE bit(1) USING "is_button_transparent"::bit(1),
      ALTER COLUMN "is_button_transparent" SET DEFAULT '0'::bit(1),
      ALTER COLUMN "is_button_transparent" SET NOT NULL;
    `);

    // You can add or modify any foreign key constraints here if necessary
    // Add foreign key constraints like you have in your original code, with 'NOT VALID' if needed
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes made in the 'up' function using raw SQL
    await queryInterface.sequelize.query(`
      ALTER TABLE "about_us" 
      ALTER COLUMN "is_active" DROP DEFAULT,
      ALTER COLUMN "is_active" DROP NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "about_us" 
      ALTER COLUMN "is_deleted" DROP DEFAULT,
      ALTER COLUMN "is_deleted" DROP NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "about_us" 
      ALTER COLUMN "is_button_transparent" DROP DEFAULT,
      ALTER COLUMN "is_button_transparent" DROP NOT NULL;
    `);

    // Revert foreign key constraints to previous state if needed
  }
};
