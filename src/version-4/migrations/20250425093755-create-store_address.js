
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('store_address', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      address: {
  allowNull: true,
  type: 'character varying',
},
      map_link: {
  allowNull: true,
  type: 'character varying',
},
      branch_name: {
  allowNull: true,
  type: 'character varying',
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      is_active: {
  default:'1',
  type: 'bit(1)',},
      is_deleted: {
  default:'0',
  type: 'bit(1)',
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
    await queryInterface.dropTable('store_address');
  }
};
