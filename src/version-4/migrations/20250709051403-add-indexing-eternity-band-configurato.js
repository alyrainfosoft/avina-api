'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('config_eternity_products', ['id']);
    await queryInterface.addIndex('config_eternity_products', ['is_deleted']); 
    await queryInterface.addIndex('config_eternity_products', ['company_info_id']);
    await queryInterface.addIndex('config_eternity_products', ['side_setting_id']);
    await queryInterface.addIndex('config_eternity_products', ['product_combo_type']);
    await queryInterface.addIndex('config_eternity_products', ['product_length']);
    await queryInterface.addIndex('config_eternity_products', ['product_size']);
    await queryInterface.addIndex('config_eternity_products', ['diamond_group_id']);
    await queryInterface.addIndex('config_eternity_products', ['dia_cts']);
    await queryInterface.addIndex('config_eternity_products', ['dia_shape_id']);
    await queryInterface.addIndex('config_eternity_products', ['dia_cut_id']);
    await queryInterface.addIndex('config_eternity_products', ['dia_color']);
    await queryInterface.addIndex('config_eternity_products', ['dia_clarity_id']);
    await queryInterface.addIndex('config_eternity_products', ['id_stone']);
    await queryInterface.addIndex('config_eternity_products', ['dia_type']);
    await queryInterface.addIndex('config_eternity_product_metals', ['config_eternity_id']);
    await queryInterface.addIndex('config_eternity_product_metals', ['company_info_id']);
    await queryInterface.addIndex('config_eternity_product_metals', ['metal_id']);
    await queryInterface.addIndex('config_eternity_product_metals', ['karat_id']);
    await queryInterface.addIndex('config_eternity_product_metals', ['karat_id', 'metal_id', 'config_eternity_id', 'company_info_id']);
    await queryInterface.addIndex('config_eternity_product_diamonds', ['config_eternity_product_id']);
    await queryInterface.addIndex('config_eternity_product_diamonds', ['company_info_id']);
    await queryInterface.addIndex('config_eternity_product_diamonds', ['id_diamond_group']);
    await queryInterface.addIndex('config_eternity_products', ['id', 'company_info_id', 'is_deleted', 'side_setting_id', 'product_combo_type', 'product_length', 'product_size', 'diamond_group_id', 'dia_cts', 'dia_shape_id', 'dia_cut_id', 'dia_color', 'dia_clarity_id', 'id_stone', 'dia_type']);

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('config_eternity_products', ['id']);
    await queryInterface.removeIndex('config_eternity_products', ['is_deleted']); 
    await queryInterface.removeIndex('config_eternity_products', ['company_info_id']);
    await queryInterface.removeIndex('config_eternity_products', ['side_setting_id']);
    await queryInterface.removeIndex('config_eternity_products', ['product_combo_type']);
    await queryInterface.removeIndex('config_eternity_products', ['product_length']);
    await queryInterface.removeIndex('config_eternity_products', ['product_size']);
    await queryInterface.removeIndex('config_eternity_products', ['diamond_group_id']);
    await queryInterface.removeIndex('config_eternity_products', ['dia_cts']);
    await queryInterface.removeIndex('config_eternity_products', ['dia_shape_id']);
    await queryInterface.removeIndex('config_eternity_products', ['dia_cut_id']);
    await queryInterface.removeIndex('config_eternity_products', ['dia_color']);
    await queryInterface.removeIndex('config_eternity_products', ['dia_clarity_id']);
    await queryInterface.removeIndex('config_eternity_products', ['id_stone']);
    await queryInterface.removeIndex('config_eternity_products', ['dia_type']);
    await queryInterface.removeIndex('config_eternity_product_metals', ['config_eternity_id']);
    await queryInterface.removeIndex('config_eternity_product_metals', ['company_info_id']);
    await queryInterface.removeIndex('config_eternity_product_metals', ['metal_id']);
    await queryInterface.removeIndex('config_eternity_product_metals', ['karat_id']);
    await queryInterface.removeIndex('config_eternity_product_metals', ['karat_id', 'metal_id', 'config_eternity_id', 'company_info_id']);
    await queryInterface.removeIndex('config_eternity_product_diamonds', ['config_eternity_product_id']);
    await queryInterface.removeIndex('config_eternity_product_diamonds', ['company_info_id']);
    await queryInterface.removeIndex('config_eternity_product_diamonds', ['id_diamond_group']);
    await queryInterface.removeIndex('config_eternity_products', ['id', 'company_info_id', 'is_deleted', 'side_setting_id', 'product_combo_type', 'product_length', 'product_size', 'diamond_group_id', 'dia_cts', 'dia_shape_id', 'dia_cut_id', 'dia_color', 'dia_clarity_id', 'id_stone', 'dia_type']);
  }
};
