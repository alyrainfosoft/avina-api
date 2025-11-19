'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.sequelize.query(`ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN is_login boolean;`)

    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN is_config_login boolean;
      `)
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
