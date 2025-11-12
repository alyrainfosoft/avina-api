
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('config_bracelet_products', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      product_type: {
  allowNull: false,
  type: 'character varying',
},
      product_style: {
  allowNull: true,
  type: 'character varying',
},
      product_length: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      setting_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      hook_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      dia_total_wt: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      style_no: {
  allowNull: true,
  type: 'character varying',
},
      bracelet_no: {
  allowNull: true,
  type: 'character varying',
},
     is_active: {
      allowNull: false,
      type: 'bit(1)',
},
      is_deleted: {
        allowNull: false,
        type: 'bit(1)',
},
      created_date: {
  allowNull: false,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      product_title: {
  allowNull: false,
  type: 'character varying',
},
      sku: {
  allowNull: false,
  type: 'character varying',
},
      slug: {
  allowNull: false,
  type: 'character varying',
},
      product_sort_des: {
  allowNull: true,
  type: 'character varying',
},
      product_long_des: {
  allowNull: true,
  type: 'character varying',
},
      product_dia_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      metal_weight_type: {
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
    await queryInterface.dropTable('config_bracelet_products');
  }
};
