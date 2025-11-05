'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_diamond_group_masters ON diamond_group_masters (id, is_deleted, is_active, company_info_id);`)
    
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_config_diamond_products
    ON public.config_product_diamonds USING btree
    (config_product_id ASC NULLS LAST)
    TABLESPACE pg_default;`)
    
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_comapny_info_config_diamond_products
    ON public.config_product_diamonds USING btree
    (company_info_id ASC NULLS LAST)
    TABLESPACE pg_default;`)
    
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_diamond_group_config_diamond_products
    ON public.config_product_diamonds USING btree
    (id_diamond_group ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_comapny_info_config_metal_products
    ON public.config_product_metals USING btree
    (company_info_id ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_config_metal_products
    ON public.config_product_metals USING btree
    (config_product_id ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_cpmo_config_product_id
    ON public.config_product_metals USING btree
    (config_product_id ASC NULLS LAST, karat_id ASC NULLS LAST, metal_id ASC NULLS LAST, company_info_id ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_ring_karat_id
    ON public.config_product_metals USING btree
    (karat_id ASC NULLS LAST)
    TABLESPACE pg_default;`)

        await queryInterface.sequelize.query(`
     CREATE INDEX IF NOT EXISTS idx_ring_metal_id
    ON public.config_product_metals USING btree
    (metal_id ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
     CREATE INDEX IF NOT EXISTS idx_center_dia_shape_id
    ON public.config_products USING btree
    (center_dia_shape_id ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
     CREATE INDEX IF NOT EXISTS idx_config_products
    ON public.config_products USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
     CREATE INDEX IF NOT EXISTS idx_config_products_filter
    ON public.config_products USING btree
    (product_type COLLATE pg_catalog."default" ASC NULLS LAST, head_type_id ASC NULLS LAST, shank_type_id ASC NULLS LAST, side_setting_id ASC NULLS LAST, center_dia_type ASC NULLS LAST, center_diamond_group_id ASC NULLS LAST, company_info_id ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
     CREATE INDEX IF NOT EXISTS idx_config_products_id_title_slug_sku
    ON public.config_products USING btree
    (id ASC NULLS LAST, product_title COLLATE pg_catalog."default" ASC NULLS LAST, slug COLLATE pg_catalog."default" ASC NULLS LAST, sku COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_ring_center_dia_type
    ON public.config_products USING btree
    (center_dia_type ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_ring_center_diamond_group_id
    ON public.config_products USING btree
    (center_diamond_group_id ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_ring_company_info_id
    ON public.config_products USING btree
    (company_info_id ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_ring_head_type_id
    ON public.config_products USING btree
    (head_type_id ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_ring_product_type
    ON public.config_products USING btree
    (product_type COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_ring_shank_type_id
    ON public.config_products USING btree
    (shank_type_id ASC NULLS LAST)
    TABLESPACE pg_default;`)

    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_ring_side_setting_id
    ON public.config_products USING btree
    (side_setting_id ASC NULLS LAST)
    TABLESPACE pg_default;`)
    
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
