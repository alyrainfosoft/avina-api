'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   

await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_priceview_karat
    ON public.eternity_band_configurator_price_view USING btree
    (karat_id ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE karat_id IS NOT NULL`)


await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_priceview_json_dia_stone
    ON public.eternity_band_configurator_price_view USING btree
    (((diamonds ->> 'dia_stone'::text)::integer) ASC NULLS LAST)
    TABLESPACE pg_default`)


await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_priceview_json_dia_cuts
    ON public.eternity_band_configurator_price_view USING btree
    (((diamonds ->> 'dia_cuts'::text)::integer) ASC NULLS LAST)
    TABLESPACE pg_default`)


await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_priceview_cut
    ON public.eternity_band_configurator_price_view USING btree
    (dia_cut_id ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE dia_cut_id IS NOT NULL`)


await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_priceview_core_filters
    ON public.eternity_band_configurator_price_view USING btree
    (id_stone ASC NULLS LAST, company_info_id ASC NULLS LAST, dia_cts ASC NULLS LAST, dia_shape_id ASC NULLS LAST, side_setting_id ASC NULLS LAST, dia_type ASC NULLS LAST, product_size COLLATE pg_catalog."default" ASC NULLS LAST, metal_id ASC NULLS LAST)
    TABLESPACE pg_default`)
	

await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_priceview_clarity
    ON public.eternity_band_configurator_price_view USING btree
    (dia_clarity_id ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE dia_clarity_id IS NOT NULL`)

await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_priceview_color
    ON public.eternity_band_configurator_price_view USING btree
    (dia_color ASC NULLS LAST)
    TABLESPACE pg_default
    WHERE dia_color IS NOT NULL`)


await queryInterface.sequelize.query(`
CREATE INDEX IF NOT EXISTS idx_priceview_combo_type
    ON public.eternity_band_configurator_price_view USING btree
    (product_combo_type ASC NULLS LAST)
    TABLESPACE pg_default`)
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.sequelize.query(` DROP INDEX IF EXISTS public.idx_priceview_karat;`)
      await queryInterface.sequelize.query(` DROP INDEX IF EXISTS public.idx_priceview_json_dia_stone;`)
      await queryInterface.sequelize.query(` DROP INDEX IF EXISTS public.idx_priceview_json_dia_cuts;`)
      await queryInterface.sequelize.query(` DROP INDEX IF EXISTS public.idx_priceview_cut;`)
      await queryInterface.sequelize.query(` DROP INDEX IF EXISTS public.idx_priceview_core_filters;`)
      await queryInterface.sequelize.query(` DROP INDEX IF EXISTS public.idx_priceview_clarity;`)
      await queryInterface.sequelize.query(` DROP INDEX IF EXISTS public.idx_priceview_color;`)
      await queryInterface.sequelize.query(` DROP INDEX IF EXISTS public.idx_priceview_combo_type;`)

  }
};
