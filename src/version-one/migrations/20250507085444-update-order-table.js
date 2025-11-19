'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'default_currency',
      {
        type: Sequelize.INTEGER, allowNull: true,
        references: {
          model: 'currency_rates',
          key: 'id'
        }
      });
      
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
