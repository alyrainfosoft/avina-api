'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Index: idx_center_dia_type
await queryInterface.sequelize.query(`CREATE INDEX IF NOT EXISTS idx_center_dia_type
    ON public.ring_three_stone_configurator_price_view USING btree
    (center_dia_type ASC NULLS LAST)
    TABLESPACE pg_default`);

// Index: idx_center_diamond_group_id
await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_center_diamond_group_id
    ON public.ring_three_stone_configurator_price_view USING btree
    (center_diamond_group_id ASC NULLS LAST)
    TABLESPACE pg_default`);

// Index: idx_company_info_id
await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_company_info_id
    ON public.ring_three_stone_configurator_price_view USING btree
    (company_info_id ASC NULLS LAST)
    TABLESPACE pg_default`);

// Index: idx_head_type_id
await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_head_type_id
    ON public.ring_three_stone_configurator_price_view USING btree
    (head_type_id ASC NULLS LAST)
    TABLESPACE pg_default`);

// Index: idx_karat_id
await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_karat_id
    ON public.ring_three_stone_configurator_price_view USING btree
    (karat_id ASC NULLS LAST)
    TABLESPACE pg_default`);

// Index: idx_metal_id
await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_metal_id
    ON public.ring_three_stone_configurator_price_view USING btree
    (metal_id ASC NULLS LAST)
    TABLESPACE pg_default`);

// Index: idx_product_type
await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_product_type
    ON public.ring_three_stone_configurator_price_view USING btree
    (product_type COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default`);

// Index: idx_ring_three_stone_configurator_price_view
await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_ring_three_stone_configurator_price_view
    ON public.ring_three_stone_configurator_price_view USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default`);

// Index: idx_shank_type_id
await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_shank_type_id
    ON public.ring_three_stone_configurator_price_view USING btree
    (shank_type_id ASC NULLS LAST)
    TABLESPACE pg_default`);

// Index: idx_side_setting_id
await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_side_setting_id
    ON public.ring_three_stone_configurator_price_view USING btree
    (side_setting_id ASC NULLS LAST)
    TABLESPACE pg_default`);

  },

  async down (queryInterface, Sequelize) {
 

 await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS public.idx_center_dia_type;
    `);
 await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_center_diamond_group_id;
  `);
 await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_company_info_id;
  `);
 await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_head_type_id;
  `);
 await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_karat_id;
  `);
 await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_metal_id;
  `);
 await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_product_type;
  `);
 await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_ring_three_stone_configurator_price_view;
  `);
 await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_shank_type_id;
  `);
 await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_side_setting_id;   
  `);
  }
};
