'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('products', ['setting_style_type']);
    await queryInterface.addIndex('products', ['gender']);
    await queryInterface.addIndex('products', ['is_choose_setting']);
    await queryInterface.addIndex('products', ['id_collection']);
    await queryInterface.addIndex('products', ['is_active']);
    await queryInterface.addIndex('products', ['id_brand']);
    await queryInterface.addIndex('products', ['product_type']);
    await queryInterface.addIndex('products', ['is_3d_product']);
    await queryInterface.addIndex('products', ['name']);
    await queryInterface.addIndex('products', ['sku']);

    await queryInterface.addIndex('product_categories', ['company_info_id']);

    await queryInterface.addIndex('product_metal_options', ['id_metal']);
    await queryInterface.addIndex('product_metal_options', ['company_info_id']);
    await queryInterface.addIndex('product_metal_options', ['id_metal_tone']);
    await queryInterface.addIndex('product_metal_options', ['id_m_tone']);

    await queryInterface.addIndex('product_diamond_options', ['id_type']);
    await queryInterface.addIndex('product_diamond_options', ['is_deleted']);
    await queryInterface.addIndex('product_diamond_options', ['company_info_id']);
    await queryInterface.addIndex('product_diamond_options', ['id_stone']);
    await queryInterface.addIndex('product_diamond_options', ['id_shape']);
    await queryInterface.addIndex('product_diamond_options', ['weight']);
    await queryInterface.addIndex('product_diamond_options', ['weight','id_type']);

    await queryInterface.addIndex('offers', ['offer_type']);
    await queryInterface.addIndex('offers', ['product_type']);
    await queryInterface.addIndex('offers', ['discount_type']);
    await queryInterface.addIndex('offers', ['maximum_discount_amount']);
    await queryInterface.addIndex('offers', ['start_date']);
    await queryInterface.addIndex('offers', ['start_time']);
    await queryInterface.addIndex('offers', ['end_date']);
    await queryInterface.addIndex('offers', ['end_time']);
    await queryInterface.addIndex('offers', ['is_active']);
    await queryInterface.addIndex('offers', ['is_deleted']);
    await queryInterface.addIndex('offers', ['company_info_id']);
    await queryInterface.addIndex('offers', ['is_active', 'company_info_id', 'is_deleted']);

    await queryInterface.addIndex('offer_details', ['offer_id']);
    await queryInterface.addIndex('offer_details', ['product_id']);
    await queryInterface.addIndex('offer_details', ['category_id']);
    await queryInterface.addIndex('offer_details', ['collection_id']);
    await queryInterface.addIndex('offer_details', ['style_id']);
    await queryInterface.addIndex('offer_details', ['event_id']);
    await queryInterface.addIndex('offer_details', ['is_deleted']);
    await queryInterface.addIndex('offer_details', ['company_info_id']);
    await queryInterface.addIndex('offer_details', ['company_info_id', 'is_deleted']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('products', ['setting_style_type']);
    await queryInterface.removeIndex('products', ['gender']);
    await queryInterface.removeIndex('products', ['is_choose_setting']);
    await queryInterface.removeIndex('products', ['id_collection']);
    await queryInterface.removeIndex('products', ['is_active']);
    await queryInterface.removeIndex('products', ['id_brand']);
    await queryInterface.removeIndex('products', ['product_type']);
    await queryInterface.removeIndex('products', ['is_3d_product']);
    await queryInterface.removeIndex('products', ['name']);
    await queryInterface.removeIndex('products', ['sku']);

    await queryInterface.removeIndex('product_categories', ['company_info_id']);

    await queryInterface.removeIndex('product_metal_options', ['id_metal']);
    await queryInterface.removeIndex('product_metal_options', ['company_info_id']);
    await queryInterface.removeIndex('product_metal_options', ['id_metal_tone']);
    await queryInterface.removeIndex('product_metal_options', ['id_m_tone']);

    await queryInterface.removeIndex('product_diamond_options', ['id_type']);
    await queryInterface.removeIndex('product_diamond_options', ['is_deleted']);
    await queryInterface.removeIndex('product_diamond_options', ['company_info_id']);
    await queryInterface.removeIndex('product_diamond_options', ['id_stone']);
    await queryInterface.removeIndex('product_diamond_options', ['id_shape']);
    await queryInterface.removeIndex('product_diamond_options', ['weight']);
    await queryInterface.removeIndex('product_diamond_options', ['weight','id_type']);


  }
};
