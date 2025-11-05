'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'head_no', {
      type: 'character varying'
    } );
    await queryInterface.addColumn('products', 'shank_no', {
      type: 'character varying'
    });
    await queryInterface.addColumn('products', 'band_no', {
      type: 'character varying'
    });
    await queryInterface.addColumn('products', 'style_no', {
      type: 'character varying'
    } );
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
