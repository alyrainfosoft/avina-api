
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('birthstone_product_metal_options', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      id_product: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      id_metal_group: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      metal_weight: {
  allowNull: true,
  type: 'numeric(8,3)',
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
      is_default: {
  allowNull: false,
  default:'0',
  type: 'bit(1)',
},
      id_metal: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_karat: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_metal_tone: {
  allowNull: true,
  type: 'character varying',
},
      plu_no: {
  allowNull: true,
  type: 'character varying',
},
      price: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('birthstone_product_metal_options');
  }
};
