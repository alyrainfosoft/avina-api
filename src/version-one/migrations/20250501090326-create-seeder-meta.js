'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SeederMeta', {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      executed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SeederMeta');
  }
};
