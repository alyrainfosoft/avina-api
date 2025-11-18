'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('web_config_setting', 'whats_app_send_message_status', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
    await queryInterface.addColumn('web_config_setting', 'whats_app_send_message_api', {
      type: 'character varying',
      allowNull: true,
    });
    await queryInterface.addColumn('web_config_setting', 'whats_app_send_message_api_token', {
      type: 'character varying',
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('web_config_setting', 'send_otp_whats_app');
    await queryInterface.removeColumn('web_config_setting', 'whats_app_send_message_api');
    await queryInterface.removeColumn('web_config_setting', 'whats_app_send_message_api_token');
  }
};
