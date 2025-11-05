'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`ALTER TABLE IF EXISTS loose_diamond_group_masters DROP COLUMN IF EXISTS certificate;`)
    await queryInterface.sequelize.query(`ALTER TABLE IF EXISTS loose_diamond_group_masters DROP COLUMN IF EXISTS pair_stock;`)
    await queryInterface.sequelize.query(`ALTER TABLE IF EXISTS loose_diamond_group_masters ADD COLUMN certificate character varying;`)
    await queryInterface.sequelize.query(`ALTER TABLE IF EXISTS loose_diamond_group_masters ADD COLUMN pair_stock character varying;`)

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
