'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex(
      'config_bracelet_products',
      ['company_info_id']
    )
    await queryInterface.addIndex(
      'config_bracelet_products',
      ['is_deleted']
    )
    await queryInterface.addIndex(
      'config_bracelet_products',
      ['product_style']
    )
    await queryInterface.addIndex(
      'config_bracelet_products',
      ['product_length']
    )
    await queryInterface.addIndex(
      'config_bracelet_products',
      ['dia_total_wt']
    )
    await queryInterface.addIndex(
      'config_bracelet_products',
      ['setting_type']
    )
    await queryInterface.addIndex(
      'config_bracelet_products',
      ['hook_type']
    )
    await queryInterface.addIndex(
      'config_bracelet_products',
      ['product_dia_type']
    )
    await queryInterface.addIndex(
      'config_bracelet_products',
      ['company_info_id', 'is_deleted', 'product_style', 'product_length', 'dia_total_wt', 'setting_type', 'hook_type', 'product_dia_type']
    )

    await queryInterface.addIndex(
      'config_bracelet_product_metals',
      ['config_product_id']
    )
    await queryInterface.addIndex(
      'config_bracelet_product_metals',
      ['company_info_id']
    )
    await queryInterface.addIndex(
      'config_bracelet_product_metals',
      ['id_metal']
    )
    await queryInterface.addIndex(
      'config_bracelet_product_metals',
      ['id_karat']
    )
    await queryInterface.addIndex(
      'config_bracelet_product_metals',
      ['id_karat', 'id_metal', 'config_product_id', 'company_info_id']
    )

    await queryInterface.addIndex(
      'config_bracelet_products',
     [ 'metal_weight_type']
    )

    await queryInterface.addIndex(
      'config_bracelet_product_diamonds',
      ['config_product_id']
    )

    await queryInterface.addIndex(
      'config_bracelet_product_diamonds',
      ['stone_type']
    ) 
    await queryInterface.addIndex(
      'config_bracelet_product_diamonds',
      ['id_stone']
    )
    await queryInterface.addIndex(
      'config_bracelet_product_diamonds',
      ['id_shape']
    )
    await queryInterface.addIndex(
      'config_bracelet_product_diamonds',
      ['id_color']
    )
    await queryInterface.addIndex(
      'config_bracelet_product_diamonds',
      ['id_clarity']
    )
    await queryInterface.addIndex(
      'config_bracelet_product_diamonds',
      ['id_cut']
    )
    await queryInterface.addIndex(
      'config_bracelet_product_diamonds',
      ['alternate_stone']
    )
    await queryInterface.addIndex(
      'config_bracelet_product_diamonds',
      ['company_info_id']
    )
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
