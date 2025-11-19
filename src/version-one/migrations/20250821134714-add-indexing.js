'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`CREATE INDEX idx_product_metal_options_id_product ON product_metal_options(id_product);
CREATE INDEX idx_product_metal_options_id_karat ON product_metal_options(id_karat);
CREATE INDEX idx_product_metal_options_is_deleted ON product_metal_options(is_deleted);
CREATE INDEX idx_gold_kts_id ON gold_kts(id);
CREATE INDEX idx_gold_kts_is_deleted_is_active ON gold_kts(is_deleted, is_active);
CREATE INDEX idx_product_images_id_product ON product_images(id_product);
CREATE INDEX idx_product_images_is_deleted_image_type ON product_images(is_deleted, image_type);
CREATE INDEX idx_product_images_company_info_id ON product_images(company_info_id);
CREATE INDEX idx_web_config_setting_company_info_id ON web_config_setting(company_info_id);
CREATE INDEX idx_product_diamond_options_id_type_is_deleted ON product_diamond_options(id_type, is_deleted);
CREATE INDEX idx_product_diamond_options_is_band ON product_diamond_options(is_band);
CREATE INDEX idx_diamond_group_masters_is_deleted ON diamond_group_masters(is_deleted);
CREATE INDEX idx_products_id ON products(id);
CREATE INDEX idx_products_is_deleted_is_active ON products(is_deleted, is_active);
CREATE INDEX idx_products_company_info_id ON products(company_info_id);
CREATE INDEX idx_products_parent_id ON products(parent_id);
CREATE INDEX idx_product_categories_id_product ON product_categories(id_product);
CREATE INDEX idx_product_categories_is_deleted ON product_categories(is_deleted);
CREATE INDEX idx_product_categories_id_category ON product_categories(id_category);
CREATE INDEX idx_product_categories_id_sub_category ON product_categories(id_sub_category);
CREATE INDEX idx_product_categories_id_sub_sub_category ON product_categories(id_sub_sub_category);
CREATE INDEX idx_metal_masters_id ON metal_masters(id);
CREATE INDEX idx_metal_masters_is_deleted ON metal_masters(is_deleted);
CREATE INDEX idx_setting_styles_id ON setting_styles(id);
CREATE INDEX idx_price_correction_product_type ON price_corrections(product_type);
CREATE INDEX idx_price_correction_company_info_id ON price_corrections(company_info_id);
CREATE INDEX idx_price_correction_is_active ON price_corrections(is_active);

`)
  },
  
  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_product_metal_options_id_product;
DROP INDEX IF EXISTS idx_product_metal_options_id_karat;
DROP INDEX IF EXISTS idx_product_metal_options_is_deleted;
DROP INDEX IF EXISTS idx_gold_kts_id;
DROP INDEX IF EXISTS idx_gold_kts_is_deleted_is_active;
DROP INDEX IF EXISTS idx_product_images_id_product;
DROP INDEX IF EXISTS idx_product_images_is_deleted_image_type;
DROP INDEX IF EXISTS idx_product_images_company_info_id;
DROP INDEX IF EXISTS idx_web_config_setting_company_info_id;
DROP INDEX IF EXISTS idx_product_diamond_options_id_product;
DROP INDEX IF EXISTS idx_product_diamond_options_id_type_is_deleted;
DROP INDEX IF EXISTS idx_product_diamond_options_is_band;
DROP INDEX IF EXISTS idx_diamond_group_masters_id;
DROP INDEX IF EXISTS idx_diamond_group_masters_is_deleted;
DROP INDEX IF EXISTS idx_products_id;
DROP INDEX IF EXISTS idx_products_is_deleted_is_active;
DROP INDEX IF EXISTS idx_products_company_info_id;
DROP INDEX IF EXISTS idx_products_parent_id;
DROP INDEX IF EXISTS idx_product_categories_id_product;
DROP INDEX IF EXISTS idx_product_categories_is_deleted;
DROP INDEX IF EXISTS idx_product_categories_id_category;
DROP INDEX IF EXISTS idx_product_categories_id_sub_category;
DROP INDEX IF EXISTS idx_product_categories_id_sub_sub_category;
DROP INDEX IF EXISTS idx_metal_masters_id;
DROP INDEX IF EXISTS idx_metal_masters_is_deleted;
DROP INDEX IF EXISTS idx_setting_styles_id;
DROP INDEX IF EXISTS idx_price_correction_product_type;
DROP INDEX IF EXISTS idx_price_correction_company_info_id;
DROP INDEX IF EXISTS idx_price_correction_is_active;
`)
  }
};
