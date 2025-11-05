
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_metal_options', {
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
  type: 'numeric(8,0)',
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
  type: Sequelize.BOOLEAN,
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
      retail_price: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      compare_price: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      id_size: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_length: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      quantity: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      side_dia_weight: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      side_dia_count: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      remaing_quantity_count: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      id_m_tone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      center_diamond_price: {
  allowNull: true,
  type: 'numeric(10,3)',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},band_metal_weight:{
  allowNull: true,
  type: 'numeric',
},
band_metal_price:{
  allowNull: true,
  type: Sequelize.DOUBLE,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('product_metal_options');
  }
};
