'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_cfg_company_info_id
    ON public.bracelet_configurator_price_view USING btree
    (company_info_id ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_cfg_dia_total_wt
    ON public.bracelet_configurator_price_view USING btree
    (dia_total_wt ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_cfg_diamond_details_gin
    ON public.bracelet_configurator_price_view USING gin
    (diamond_details jsonb_path_ops)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_cfg_hook_type
    ON public.bracelet_configurator_price_view USING btree
    (hook_type ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_cfg_id_karat
    ON public.bracelet_configurator_price_view USING btree
    (id_karat ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_cfg_id_metal
    ON public.bracelet_configurator_price_view USING btree
    (id_metal ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_cfg_metal_weight_type
    ON public.bracelet_configurator_price_view USING btree
    (metal_weight_type COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_cfg_product_dia_type
    ON public.bracelet_configurator_price_view USING btree
    (product_dia_type ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_cfg_product_length
    ON public.bracelet_configurator_price_view USING btree
    (product_length ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_cfg_product_style
    ON public.bracelet_configurator_price_view USING btree
    (product_style COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_cfg_setting_type
    ON public.bracelet_configurator_price_view USING btree
    (setting_type ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_cfg_stone_combination_type
    ON public.bracelet_configurator_price_view USING btree
    (stone_combination_type COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_bracelet_configurator_price_view
    ON public.bracelet_configurator_price_view USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_diamond_details_gin
    ON public.bracelet_configurator_price_view USING gin
    (diamond_details)
    TABLESPACE pg_default;
    `);

  },

  async down (queryInterface, Sequelize) {
     await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_bracelet_cfg_company_info_id;
    `);
    await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_bracelet_cfg_dia_total_wt;
    `);
    await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_bracelet_cfg_diamond_details_gin;
    `);
    await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_bracelet_cfg_hook_type;
    `);
    await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_bracelet_cfg_id_karat;
    `);
    await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_bracelet_cfg_id_metal;
    `);
    await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_bracelet_cfg_metal_weight_type;
    `);
    await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_bracelet_cfg_product_dia_type;
    `);
    await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_bracelet_cfg_product_length;
    `);
    await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_bracelet_cfg_product_style;
    `);
    await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_bracelet_cfg_setting_type;
    `);
    await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_bracelet_cfg_stone_combination_type;
    `);
    await queryInterface.sequelize.query(`
     DROP INDEX IF EXISTS public.idx_bracelet_configurator_price_view;
    `);
    await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_diamond_details_gin;
    `);
  }
};
