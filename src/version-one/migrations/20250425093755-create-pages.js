
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pages', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      name: {
  allowNull: false,
  type: 'character varying',
},
      description: {
  allowNull: true,
  type: 'character varying',
},
      url: {
  allowNull: true,
  type: 'character varying',
},
      is_active: {
  allowNull: true,
  type: 'bit(1)',},
      is_restrict: {
  allowNull: true,
  type: 'bit(1)',},
      is_deleted: {
  allowNull: true,
  type: 'bit(1)',},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('pages');
  }
};
