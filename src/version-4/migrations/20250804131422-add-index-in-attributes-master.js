'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('gemstones', ['is_config']);
    await queryInterface.addIndex('gemstones', ['is_band']);
    await queryInterface.addIndex('gemstones', ['is_three_stone']);
    await queryInterface.addIndex('gemstones', ['is_bracelet']);
    await queryInterface.addIndex('gemstones', ['is_pendant']);
    await queryInterface.addIndex('gemstones', ['is_earring']);
    await queryInterface.addIndex('gemstones', ['is_deleted']);
    await queryInterface.addIndex('gemstones', ['company_info_id']);

    await queryInterface.addIndex('diamond_shapes', ['is_config']);
    await queryInterface.addIndex('diamond_shapes', ['is_band']);
    await queryInterface.addIndex('diamond_shapes', ['is_three_stone']);
    await queryInterface.addIndex('diamond_shapes', ['is_bracelet']);
    await queryInterface.addIndex('diamond_shapes', ['is_pendant']);
    await queryInterface.addIndex('diamond_shapes', ['is_earring']);
    await queryInterface.addIndex('diamond_shapes', ['is_deleted']);
    await queryInterface.addIndex('diamond_shapes', ['company_info_id']);

    await queryInterface.addIndex('carat_sizes', ['is_config']);
    await queryInterface.addIndex('carat_sizes', ['is_band']);
    await queryInterface.addIndex('carat_sizes', ['is_three_stone']);
    await queryInterface.addIndex('carat_sizes', ['is_bracelet']);
    await queryInterface.addIndex('carat_sizes', ['is_pendant']);
    await queryInterface.addIndex('carat_sizes', ['is_earring']);
    await queryInterface.addIndex('carat_sizes', ['is_deleted']);
    await queryInterface.addIndex('carat_sizes', ['company_info_id']);

    await queryInterface.addIndex('heads', ['is_config']);
    await queryInterface.addIndex('heads', ['is_band']);
    await queryInterface.addIndex('heads', ['is_three_stone']);
    await queryInterface.addIndex('heads', ['is_bracelet']);
    await queryInterface.addIndex('heads', ['is_pendant']);
    await queryInterface.addIndex('heads', ['is_earring']);
    await queryInterface.addIndex('heads', ['is_deleted']);
    await queryInterface.addIndex('heads', ['company_info_id']);

    await queryInterface.addIndex('shanks', ['is_config']);
    await queryInterface.addIndex('shanks', ['is_band']);
    await queryInterface.addIndex('shanks', ['is_three_stone']);
    await queryInterface.addIndex('shanks', ['is_bracelet']);
    await queryInterface.addIndex('shanks', ['is_pendant']);
    await queryInterface.addIndex('shanks', ['is_earring']);
    await queryInterface.addIndex('shanks', ['is_deleted']);
    await queryInterface.addIndex('shanks', ['company_info_id']);

    await queryInterface.addIndex('side_setting_styles', ['is_config']);
    await queryInterface.addIndex('side_setting_styles', ['is_band']);
    await queryInterface.addIndex('side_setting_styles', ['is_three_stone']);
    await queryInterface.addIndex('side_setting_styles', ['is_bracelet']);
    await queryInterface.addIndex('side_setting_styles', ['is_pendant']);
    await queryInterface.addIndex('side_setting_styles', ['is_earring']);
    await queryInterface.addIndex('side_setting_styles', ['is_deleted']);
    await queryInterface.addIndex('side_setting_styles', ['company_info_id']);

    await queryInterface.addIndex('categories', ['is_deleted']);
    await queryInterface.addIndex('categories', ['is_active']);
    await queryInterface.addIndex('categories', ['category_name']);
    await queryInterface.addIndex('categories', ['parent_id']);
    await queryInterface.addIndex('categories', ['company_info_id']);

    await queryInterface.addIndex('metal_masters', ['is_config']);
    await queryInterface.addIndex('metal_masters', ['is_band']);
    await queryInterface.addIndex('metal_masters', ['is_three_stone']);
    await queryInterface.addIndex('metal_masters', ['is_bracelet']);
    await queryInterface.addIndex('metal_masters', ['is_pendant']);
    await queryInterface.addIndex('metal_masters', ['is_earring']);
    await queryInterface.addIndex('metal_masters', ['is_deleted']);
    await queryInterface.addIndex('metal_masters', ['company_info_id']);

    await queryInterface.addIndex('gold_kts', ['is_config']);
    await queryInterface.addIndex('gold_kts', ['is_band']);
    await queryInterface.addIndex('gold_kts', ['is_three_stone']);
    await queryInterface.addIndex('gold_kts', ['is_bracelet']);
    await queryInterface.addIndex('gold_kts', ['is_pendant']);
    await queryInterface.addIndex('gold_kts', ['is_earring']);
    await queryInterface.addIndex('gold_kts', ['is_deleted']);
    await queryInterface.addIndex('gold_kts', ['company_info_id']);

    await queryInterface.addIndex('metal_tones', ['is_config']);
    await queryInterface.addIndex('metal_tones', ['is_band']);
    await queryInterface.addIndex('metal_tones', ['is_three_stone']);
    await queryInterface.addIndex('metal_tones', ['is_bracelet']);
    await queryInterface.addIndex('metal_tones', ['is_pendant']);
    await queryInterface.addIndex('metal_tones', ['is_earring']);
    await queryInterface.addIndex('metal_tones', ['is_deleted']);
    await queryInterface.addIndex('metal_tones', ['company_info_id']);

    await queryInterface.addIndex('cuts', ['is_config']);
    await queryInterface.addIndex('cuts', ['is_band']);
    await queryInterface.addIndex('cuts', ['is_three_stone']);
    await queryInterface.addIndex('cuts', ['is_bracelet']);
    await queryInterface.addIndex('cuts', ['is_pendant']);
    await queryInterface.addIndex('cuts', ['is_earring']);
    await queryInterface.addIndex('cuts', ['is_deleted']);
    await queryInterface.addIndex('cuts', ['company_info_id']);

    await queryInterface.addIndex('items_sizes', ['is_deleted']);
    await queryInterface.addIndex('items_sizes', ['company_info_id']);

    await queryInterface.addIndex('items_lengths', ['is_deleted']);
    await queryInterface.addIndex('items_lengths', ['company_info_id']);

    await queryInterface.addIndex('diamond_group_masters', ['is_config']);
    await queryInterface.addIndex('diamond_group_masters', ['is_band']);
    await queryInterface.addIndex('diamond_group_masters', ['is_three_stone']);
    await queryInterface.addIndex('diamond_group_masters', ['is_bracelet']);
    await queryInterface.addIndex('diamond_group_masters', ['is_pendant']);
    await queryInterface.addIndex('diamond_group_masters', ['is_earring']);
    await queryInterface.addIndex('diamond_group_masters', ['is_deleted']);
    await queryInterface.addIndex('diamond_group_masters', ['company_info_id']);

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('gemstones', ['is_config']);
    await queryInterface.removeIndex('gemstones', ['is_band']);
    await queryInterface.removeIndex('gemstones', ['is_three_stone']);
    await queryInterface.removeIndex('gemstones', ['is_bracelet']);
    await queryInterface.removeIndex('gemstones', ['is_pendant']);
    await queryInterface.removeIndex('gemstones', ['is_earring']);
    await queryInterface.removeIndex('gemstones', ['is_deleted']);
    await queryInterface.removeIndex('gemstones', ['company_info_id']);

    await queryInterface.removeIndex('diamond_shapes', ['is_config']);
    await queryInterface.removeIndex('diamond_shapes', ['is_band']);
    await queryInterface.removeIndex('diamond_shapes', ['is_three_stone']);
    await queryInterface.removeIndex('diamond_shapes', ['is_bracelet']);
    await queryInterface.removeIndex('diamond_shapes', ['is_pendant']);
    await queryInterface.removeIndex('diamond_shapes', ['is_earring']);
    await queryInterface.removeIndex('diamond_shapes', ['is_deleted']);
    await queryInterface.removeIndex('diamond_shapes', ['company_info_id']);

    await queryInterface.removeIndex('carat_sizes', ['is_config']);
    await queryInterface.removeIndex('carat_sizes', ['is_band']);
    await queryInterface.removeIndex('carat_sizes', ['is_three_stone']);
    await queryInterface.removeIndex('carat_sizes', ['is_bracelet']);
    await queryInterface.removeIndex('carat_sizes', ['is_pendant']);
    await queryInterface.removeIndex('carat_sizes', ['is_earring']);
    await queryInterface.removeIndex('carat_sizes', ['is_deleted']);
    await queryInterface.removeIndex('carat_sizes', ['company_info_id']);

    await queryInterface.removeIndex('heads', ['is_config']);
    await queryInterface.removeIndex('heads', ['is_band']);
    await queryInterface.removeIndex('heads', ['is_three_stone']);
    await queryInterface.removeIndex('heads', ['is_bracelet']);
    await queryInterface.removeIndex('heads', ['is_pendant']);
    await queryInterface.removeIndex('heads', ['is_earring']);
    await queryInterface.removeIndex('heads', ['is_deleted']);
    await queryInterface.removeIndex('heads', ['company_info_id']);

    await queryInterface.removeIndex('shanks', ['is_config']);
    await queryInterface.removeIndex('shanks', ['is_band']);
    await queryInterface.removeIndex('shanks', ['is_three_stone']);
    await queryInterface.removeIndex('shanks', ['is_bracelet']);
    await queryInterface.removeIndex('shanks', ['is_pendant']);
    await queryInterface.removeIndex('shanks', ['is_earring']);
    await queryInterface.removeIndex('shanks', ['is_deleted']);
    await queryInterface.removeIndex('shanks', ['company_info_id']);

    await queryInterface.removeIndex('side_setting_styles', ['is_config']);
    await queryInterface.removeIndex('side_setting_styles', ['is_band']);
    await queryInterface.removeIndex('side_setting_styles', ['is_three_stone']);
    await queryInterface.removeIndex('side_setting_styles', ['is_bracelet']);
    await queryInterface.removeIndex('side_setting_styles', ['is_pendant']);
    await queryInterface.removeIndex('side_setting_styles', ['is_earring']);
    await queryInterface.removeIndex('side_setting_styles', ['is_deleted']);
    await queryInterface.removeIndex('side_setting_styles', ['company_info_id']);

    await queryInterface.removeIndex('categories', ['is_deleted']);
    await queryInterface.removeIndex('categories', ['is_active']);
    await queryInterface.removeIndex('categories', ['category_name']);
    await queryInterface.removeIndex('categories', ['parent_id']);
    await queryInterface.removeIndex('categories', ['company_info_id']);

    await queryInterface.removeIndex('metal_masters', ['is_config']);
    await queryInterface.removeIndex('metal_masters', ['is_band']);
    await queryInterface.removeIndex('metal_masters', ['is_three_stone']);
    await queryInterface.removeIndex('metal_masters', ['is_bracelet']);
    await queryInterface.removeIndex('metal_masters', ['is_pendant']);
    await queryInterface.removeIndex('metal_masters', ['is_earring']);
    await queryInterface.removeIndex('metal_masters', ['is_deleted']);
    await queryInterface.removeIndex('metal_masters', ['company_info_id']);

    await queryInterface.removeIndex('gold_kts', ['is_config']);
    await queryInterface.removeIndex('gold_kts', ['is_band']);
    await queryInterface.removeIndex('gold_kts', ['is_three_stone']);
    await queryInterface.removeIndex('gold_kts', ['is_bracelet']);
    await queryInterface.removeIndex('gold_kts', ['is_pendant']);
    await queryInterface.removeIndex('gold_kts', ['is_earring']);
    await queryInterface.removeIndex('gold_kts', ['is_deleted']);
    await queryInterface.removeIndex('gold_kts', ['company_info_id']);

    await queryInterface.removeIndex('metal_tones', ['is_config']);
    await queryInterface.removeIndex('metal_tones', ['is_band']);
    await queryInterface.removeIndex('metal_tones', ['is_three_stone']);
    await queryInterface.removeIndex('metal_tones', ['is_bracelet']);
    await queryInterface.removeIndex('metal_tones', ['is_pendant']);
    await queryInterface.removeIndex('metal_tones', ['is_earring']);
    await queryInterface.removeIndex('metal_tones', ['is_deleted']);
    await queryInterface.removeIndex('metal_tones', ['company_info_id']);

    await queryInterface.removeIndex('cuts', ['is_config']);
    await queryInterface.removeIndex('cuts', ['is_band']);
    await queryInterface.removeIndex('cuts', ['is_three_stone']);
    await queryInterface.removeIndex('cuts', ['is_bracelet']);
    await queryInterface.removeIndex('cuts', ['is_pendant']);
    await queryInterface.removeIndex('cuts', ['is_earring']);
    await queryInterface.removeIndex('cuts', ['is_deleted']);
    await queryInterface.removeIndex('cuts', ['company_info_id']);

    await queryInterface.removeIndex('items_sizes', ['is_deleted']);
    await queryInterface.removeIndex('items_sizes', ['company_info_id']);

    await queryInterface.removeIndex('items_lengths', ['is_deleted']);
    await queryInterface.removeIndex('items_lengths', ['company_info_id']);

    await queryInterface.removeIndex('diamond_group_masters', ['is_config']);
    await queryInterface.removeIndex('diamond_group_masters', ['is_band']);
    await queryInterface.removeIndex('diamond_group_masters', ['is_three_stone']);
    await queryInterface.removeIndex('diamond_group_masters', ['is_bracelet']);
    await queryInterface.removeIndex('diamond_group_masters', ['is_pendant']);
    await queryInterface.removeIndex('diamond_group_masters', ['is_earring']);
    await queryInterface.removeIndex('diamond_group_masters', ['is_deleted']);
    await queryInterface.removeIndex('diamond_group_masters', ['company_info_id']);
  }
};
