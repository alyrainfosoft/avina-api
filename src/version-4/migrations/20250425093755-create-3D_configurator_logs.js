
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('3D_configurator_logs', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      username: {
  allowNull: true,
  type: 'character varying',
},
      otp: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      otp_expiry_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      login_count: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      detail_json: {
  allowNull: true,
  type: Sequelize.JSON,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('3D_configurator_logs');
  }
};
