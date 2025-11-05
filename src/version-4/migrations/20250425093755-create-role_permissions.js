
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permissions', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      id_role: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      id_menu_item: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
     is_active: {
  default:'1',
  type: 'bit(1)',
},
      created_by: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: false,
  type: Sequelize.DATE,
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
    await queryInterface.dropTable('role_permissions');
  }
};
