
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu_items', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      name: {
  allowNull: false,
  type: 'character varying(100)',
},
      id_parent_menu: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      nav_path: {
  allowNull: true,
  type: 'character varying(200)',
},
      menu_location: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      sort_order: {
  allowNull: false,
  type: 'numeric(5,2)',
},
     is_active: {
  default:'0',
  type: 'bit(1)',
},
      is_deleted: {
  default:'0',
  type: 'bit(1)',
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
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
      icon: {
  allowNull: true,
  type: 'character varying(500)',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_for_super_admin: {
  allowNull: true,
  default:false,
  type: Sequelize.BOOLEAN,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('menu_items');
  }
};
