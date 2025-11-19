'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('roles', 'is_super_admin', {
        type: Sequelize.BOOLEAN,
        allowNull: true, // or false if you want to require it
        defaultValue: false, // optional default value
      }),
      queryInterface.addColumn('roles', 'is_sub_admin', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('roles', 'is_super_admin'),
      queryInterface.removeColumn('roles', 'is_sub_admin'),
    ]);
  },
};
