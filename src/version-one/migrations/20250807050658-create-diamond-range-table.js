'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diamond_ranges', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        autoIncrementIdentity: true,
        type: Sequelize.INTEGER,
      },
      carat_value: {
        allowNull: false,
        type: 'character varying',
      },
      min_carat_range: {
        allowNull: false,
        type: 'character varying',
      },
      max_carat_range: {
        allowNull: false,
        type: 'character varying'
      },

    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('diamond_ranges');
  }
};
