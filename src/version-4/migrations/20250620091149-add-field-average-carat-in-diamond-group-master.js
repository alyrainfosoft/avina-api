'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.addColumn('diamond_group_masters', 'average_carat', { type: Sequelize.FLOAT });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('diamond_group_masters', 'average_carat');
  }
};
