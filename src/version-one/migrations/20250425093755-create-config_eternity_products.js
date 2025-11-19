
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('config_eternity_products', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      side_setting_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      style_no: {
  allowNull: true,
  type: 'character varying',
},
      product_title: {
  allowNull: false,
  type: 'character varying',
},
      product_sort_des: {
  allowNull: false,
  type: 'character varying',
},
      product_long_des: {
  allowNull: false,
  type: 'character varying',
},
      sku: {
  allowNull: false,
  type: 'character varying',
},
      dia_cts: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      dia_shape_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_clarity_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_cut_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_mm_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_color: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_count: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      diamond_group_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      prod_dia_total_count: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      alternate_dia_count: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      product_type: {
  allowNull: true,
  type: 'character varying',
},
      product_size: {
  allowNull: true,
  type: 'character varying',
},
      product_combo_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      slug: {
  allowNull: true,
  type: 'character varying',
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      labour_charge: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      is_deleted: {
  allowNull: true,
  type: 'bit(1)',
},
      other_charge: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      discount_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      discount_value: {
  allowNull: true,
  type: 'character varying',
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_type: {
  allowNull: true,
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
      id_stone: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      product_length: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('config_eternity_products');
  }
};
