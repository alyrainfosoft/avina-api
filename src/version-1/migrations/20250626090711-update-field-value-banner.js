'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
    ALTER TABLE public.banners
    ALTER COLUMN name TYPE character varying COLLATE pg_catalog."default";
    `)
    await queryInterface.sequelize.query(`    ALTER TABLE public.banners
    ALTER COLUMN target_url TYPE character varying COLLATE pg_catalog."default";
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
