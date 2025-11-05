'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "configurator_setting" 
      ADD COLUMN  "link" VARCHAR ,
      ADD COLUMN  "description" TEXT ;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "info_sections" 
      ADD COLUMN "created_at" TIMESTAMPTZ;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "loose_diamond_group_masters" 
      ADD COLUMN  "created_at" TIMESTAMPTZ,
      ADD COLUMN  "deleted_at" TIMESTAMPTZ;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "masters" 
      ADD COLUMN  "created_at" TIMESTAMPTZ,
      ADD COLUMN  "deleted_at" TIMESTAMPTZ;
    `);   
    await queryInterface.sequelize.query(`
      ALTER TABLE "theme_attributes" 
      DROP COLUMN  "id_theme_attribute";
    `);   
  },

  async down (queryInterface, Sequelize) {
    // Reverse the changes (optional but recommended)
    await queryInterface.sequelize.query(`
      ALTER TABLE "configurator_setting"
      DROP COLUMN "link",
      DROP COLUMN "description";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "info_sections"
      DROP COLUMN "created_at";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "loose_diamond_group_masters"
      DROP COLUMN "created_at",
      DROP COLUMN "deleted_at";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "masters"
      DROP COLUMN "created_at",
      DROP COLUMN "deleted_at";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "theme_attributes"
      ADD COLUMN "id_theme_attribute" SERIAL PRIMARY KEY; -- or use the correct original type
    `);
  }
};
