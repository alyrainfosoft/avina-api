
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('metal_masters', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      name: {
  allowNull: false,
  type: 'character varying',
},
      slug: {
  allowNull: false,
  type: 'character varying',
},
      created_by: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
     is_active: {
  default:'1',
  type: 'bit(1)',
},
      is_deleted: {
  default:'0',
  type: 'bit(1)',
},
      metal_rate: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      is_config: {
 default:'0',
  type: 'bit(1)',
},
      is_band: {
 default:'0',
  type: 'bit(1)',
},
      is_three_stone: {
 default:'0',
  type: 'bit(1)',
},
      is_bracelet: {
 default:'0',
  type: 'bit(1)',
},
      is_pendant: {
 default:'0',
  type: 'bit(1)',
},
      is_earring: {
 default:'0',
  type: 'bit(1)',
},
      calculate_rate: {
  allowNull: true,
  default:1,
  type: Sequelize.DOUBLE,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('metal_masters');
  }
};
