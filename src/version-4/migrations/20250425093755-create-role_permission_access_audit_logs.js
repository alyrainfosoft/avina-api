
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permission_access_audit_logs', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      id_role_permission_access: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      old_value: {
  allowNull: false,
  type: Sequelize.BOOLEAN,
},
      new_value: {
  allowNull: false,
  type: Sequelize.BOOLEAN,
},
      changed_by: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      changed_date: {
  allowNull: false,
  type: Sequelize.DATE,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('role_permission_access_audit_logs');
  }
};
