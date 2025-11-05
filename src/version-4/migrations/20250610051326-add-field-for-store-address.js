'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('store_address',
      'phone_number',
      {
        type: 'character varying',
        allowNull: true,
      }
    ),
    await queryInterface.addColumn('store_address',
      'timing',
      {
        type: 'character varying',
        allowNull: true,
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('store_address', 'phone_number');
    await queryInterface.removeColumn('store_address', 'timing');
  }
};
