
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('config_products', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      shank_type_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      side_setting_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      head_type_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      head_no: {
  allowNull: true,
  type: 'character varying',
},
      shank_no: {
  allowNull: true,
  type: 'character varying',
},
      ring_no: {
  allowNull: true,
  type: 'character varying',
},
      render_folder_name: {
  allowNull: true,
  type: 'character varying',
},
      band_render_upload_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      render_upload_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      cad_upload_date: {
  allowNull: true,
  type: Sequelize.DATE,
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
      center_dia_cts: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      center_dia_size: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      center_dia_shape_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      center_dia_clarity_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      center_dia_cut_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      center_dia_mm_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      center_dia_color: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      center_dia_total_count: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      prod_dia_total_count: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      prod_dia_total_cts: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      slug: {
  allowNull: true,
  type: 'character varying',
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      product_metal_weight: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      center_diamond_group_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      center_diamond_weigth: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      laber_charge: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      is_deleted: {
  allowNull: true,
  type: 'bit(1)',
},
      band_no: {
  allowNull: true,
  type: 'character varying',
},
      other_changes: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      product_type: {
  allowNull: true,
  type: 'character varying',
},
      product_style: {
  allowNull: true,
  type: 'character varying',
},
      product_total_diamond: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      style_no: {
  allowNull: true,
  type: 'character varying',
},
      file_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      retail_price: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      compare_price: {
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
      style_no_wb: {
  allowNull: true,
  type: 'character varying',
},
      center_dia_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('config_products');
  }
};
