
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exception_logs', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      request_body: {
  allowNull: true,
  type: Sequelize.JSON,
},
      request_query: {
  allowNull: true,
  type: Sequelize.JSON,
},
      request_param: {
  allowNull: true,
  type: Sequelize.JSON,
},
      error: {
  allowNull: true,
  type: Sequelize.JSON,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      response: {
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
    await queryInterface.dropTable('exception_logs');
  }
};
