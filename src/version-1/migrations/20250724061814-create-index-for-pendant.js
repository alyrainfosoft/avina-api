'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `
CREATE INDEX IF NOT EXISTS idx_config_pendant_products_company_deleted 
ON CONFIG_PENDANT_PRODUCTS (company_info_id, is_deleted);

CREATE INDEX IF NOT EXISTS idx_config_pendant_products_active_deleted 
ON CONFIG_PENDANT_PRODUCTS (is_active, is_deleted);

CREATE INDEX IF NOT EXISTS idx_config_pendant_metals_pendant 
ON CONFIG_PENDANT_METALS (pendant_id);

CREATE INDEX IF NOT EXISTS idx_config_pendant_diamonds_pendant 
ON CONFIG_PENDANT_DIAMONDS (pendant_id);

CREATE INDEX IF NOT EXISTS idx_pendant_metals_metal_karat 
ON CONFIG_PENDANT_METALS (pendant_id, metal_id, karat_id);

CREATE INDEX IF NOT EXISTS idx_pendant_diamonds_shape_size 
ON CONFIG_PENDANT_DIAMONDS (pendant_id, dia_shape, dia_mm_size);

CREATE INDEX IF NOT EXISTS idx_pendant_products_search 
ON CONFIG_PENDANT_PRODUCTS (name, slug, sku);

CREATE INDEX IF NOT EXISTS idx_pendant_products_slug 
ON CONFIG_PENDANT_PRODUCTS (slug) WHERE is_deleted = '0';
      `
    )
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `
DROP INDEX IF EXISTS idx_config_pendant_products_company_deleted;
DROP INDEX IF EXISTS idx_config_pendant_products_active_deleted;
DROP INDEX IF EXISTS idx_config_pendant_metals_pendant;
DROP INDEX IF EXISTS idx_config_pendant_diamonds_pendant;
DROP INDEX IF EXISTS idx_pendant_metals_metal_karat;
DROP INDEX IF EXISTS idx_pendant_diamonds_shape_size;
DROP INDEX IF EXISTS idx_pendant_products_search;
DROP INDEX IF EXISTS idx_pendant_products_slug;
      `
    )
  }
};
