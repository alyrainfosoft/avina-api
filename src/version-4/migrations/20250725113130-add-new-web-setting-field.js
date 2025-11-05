'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.web_config_setting
      ADD COLUMN google_map_api_key character varying;

      ALTER TABLE IF EXISTS public.web_config_setting
      ADD COLUMN pendant_glb_key character varying;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.web_config_setting
      DROP COLUMN IF EXISTS google_map_api_key;

      ALTER TABLE IF EXISTS public.web_config_setting
      DROP COLUMN IF EXISTS pendant_glb_key;
    `);
  }
};
