'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.sequelize.query(`
     ALTER TABLE IF EXISTS public.web_config_setting
      ADD COLUMN stud_glb_key character varying;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.web_config_setting
       DROP COLUMN stud_glb_key;
     `);
  }
};
