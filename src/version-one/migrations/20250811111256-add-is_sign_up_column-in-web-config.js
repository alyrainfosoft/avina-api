'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.addColumn('web_config_setting', 'is_sign_up', { type: Sequelize.BOOLEAN });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('web_config_setting', 'is_sign_up');
  }
};
