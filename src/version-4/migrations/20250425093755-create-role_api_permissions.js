
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_api_permissions', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      id_menu_item: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      id_action: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      api_endpoint: {
  allowNull: false,
  type: 'character varying',
},
      http_method: {
  allowNull: false,
  type: Sequelize.SMALLINT,
},
     is_active: {
  default:'1',
  type: 'bit(1)',
},
      master_type: {
  allowNull: true,
  type: 'character varying',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('role_api_permissions');
  }
};
