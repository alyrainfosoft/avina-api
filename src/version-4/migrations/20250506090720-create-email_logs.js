'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      raw_subject:{
        type: Sequelize.STRING,
        allowNull: true
      },
      actual_subject: {
        type: Sequelize.JSON,
        allowNull: true
      },
      containt_replace_payload: {
        type: Sequelize.JSON,
        allowNull: true
      },
      raw_body: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      actual_body: {
        type: Sequelize.JSON,
        allowNull: true
      },
      to: {
        type: Sequelize.STRING,
        allowNull: true
      },
      from: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cc: {
        type: Sequelize.STRING,
        allowNull: true
      },
      configuration_value: {
        type: Sequelize.JSON,
      },
      mail_type: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      attachment: {
          type: Sequelize.JSON,
          allowNull: true,
      },
      mail_for: {
        type: Sequelize.ENUM('1',
          '2',
          '3', 
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
          '13',
          '14',
          '15',),
        allowNull: true,
      },
      response_status: {
        type: Sequelize.ENUM('success', 'error', 'pending'),
        allowNull: true,
        defaultValue: 'pending'
      },
      success_response: {
        type: Sequelize.JSON,
        allowNull: true
      },
      error_message: {
        type: Sequelize.JSON,
        allowNull: true
      },
      is_dunamic: {
        type:Sequelize.BOOLEAN,
        defaultValue:true,
        allowNull:false
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      company_info_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('email_logs');
  }
};
