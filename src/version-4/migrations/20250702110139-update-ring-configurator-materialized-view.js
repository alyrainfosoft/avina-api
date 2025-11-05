'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  
    await queryInterface.sequelize.query(`
      DROP MATERIALIZED VIEW IF EXISTS public.ring_three_stone_configurator_price_view;

      CREATE MATERIALIZED VIEW IF NOT EXISTS public.ring_three_stone_configurator_price_view
      TABLESPACE pg_default
      AS
      WITH productmetal AS (
              SELECT cpmo.config_product_id,
                  max(cpmo.karat_id) AS karat_id,
                  max(cpmo.metal_id) AS metal_id,
                  sum(
                      CASE
                          WHEN lower(cpmo.head_shank_band::text) = 'band'::text THEN 0::double precision
                          ELSE cpmo.metal_wt
                      END) AS metal_weight,
                  sum(cpmo.metal_wt) AS with_band_metal_weight,
                  sum(cpmo.metal_wt *
                      CASE
                          WHEN cpmo.karat_id IS NULL THEN metal_master.metal_rate
                          ELSE metal_master.metal_rate / metal_master.calculate_rate * gold_kts.calculate_rate
                      END + COALESCE(cpmo.labor_charge, 0::double precision)) AS metal_rate,
                  sum(
                      CASE
                          WHEN lower(cpmo.head_shank_band::text) = 'band'::text THEN 0::double precision
                          ELSE cpmo.metal_wt *
                          CASE
                              WHEN cpmo.karat_id IS NULL THEN metal_master.metal_rate
                              ELSE metal_master.metal_rate / metal_master.calculate_rate * gold_kts.calculate_rate
                          END + COALESCE(cpmo.labor_charge, 0::double precision)
                      END) AS without_band_metal_rate
                FROM config_product_metals cpmo
                  LEFT JOIN metal_masters metal_master ON metal_master.id = cpmo.metal_id
                  LEFT JOIN gold_kts ON gold_kts.id = cpmo.karat_id
                GROUP BY cpmo.config_product_id
              ), productdiamond AS (
              SELECT cpdo.config_product_id,
                  sum(cpdo.dia_stone) FILTER (WHERE lower(cpdo.product_type::text) ~~* 'side'::text) AS dia_stone,
                  jsonb_agg(DISTINCT jsonb_build_object('dia_count', cpdo.dia_count, 'dia_weight', cpdo.dia_weight, 'product_type', cpdo.product_type)) FILTER (WHERE lower(cpdo.product_type::text) ~~* 'side'::text) AS cpdo,
                  COALESCE(sum(
                      CASE
                          WHEN lower(cpdo.product_type::text) = 'side'::text THEN pdgm.rate * cpdo.dia_count::double precision *
                          CASE
                              WHEN gemstones.is_diamond = 1 THEN
                              CASE
                                  WHEN pdgm.average_carat IS NOT NULL THEN pdgm.average_carat
                                  ELSE cpdo.dia_weight
                              END
                              ELSE 1::double precision
                          END
                          ELSE pdgm.rate * cpdo.dia_count::double precision * cpdo.dia_weight
                      END), 0::double precision) AS diamond_rate,
                  COALESCE(sum(cpdo.dia_count::double precision * cpdo.dia_weight), 0::double precision) AS with_band_diamond_weight,
                  COALESCE(sum(
                      CASE
                          WHEN cpdo.product_type::text ~~* 'band'::text THEN 0::double precision
                          ELSE cpdo.dia_count::double precision * cpdo.dia_weight
                      END), 0::double precision) AS diamond_weight,
                  COALESCE(sum(
                      CASE
                          WHEN cpdo.product_type::text ~~* 'band'::text THEN 0::double precision
                          ELSE pdgm.rate * cpdo.dia_count::double precision * cpdo.dia_weight
                      END), 0::double precision) AS without_band_diamond_rate
                FROM config_product_diamonds cpdo
                  LEFT JOIN diamond_group_masters pdgm ON cpdo.id_diamond_group = pdgm.id
                  LEFT JOIN gemstones ON gemstones.id = pdgm.id_stone
                GROUP BY cpdo.config_product_id
              ), productprice AS (
              SELECT cp_1.id AS config_product_id,
                  cz.value AS center_dia_weight,
                  ceil(
                      CASE
                          WHEN cp_1.center_dia_type = 1 THEN
                          CASE
                              WHEN stone.is_diamond = 1 THEN
                              CASE
                                  WHEN dgm.average_carat IS NOT NULL THEN dgm.rate * dgm.average_carat
                                  ELSE dgm.rate * cz.value::double precision
                              END
                              ELSE dgm.rate
                          END
                          ELSE
                          CASE
                              WHEN stone.is_diamond = 1 THEN
                              CASE
                                  WHEN dgm.average_carat IS NOT NULL THEN dgm.synthetic_rate * dgm.average_carat
                                  ELSE dgm.synthetic_rate * cz.value::double precision
                              END
                              ELSE dgm.synthetic_rate
                          END
                      END + COALESCE(cp_1.laber_charge, 0::double precision) + COALESCE(pm_1.metal_rate, 0::double precision) + COALESCE(pd_1.diamond_rate, 0::double precision)) AS with_band_price,
                  ceil(
                      CASE
                          WHEN cp_1.center_dia_type = 1 THEN
                          CASE
                              WHEN stone.is_diamond = 1 THEN
                              CASE
                                  WHEN dgm.average_carat IS NOT NULL THEN dgm.rate * dgm.average_carat
                                  ELSE dgm.rate * cz.value::double precision
                              END
                              ELSE dgm.rate
                          END
                          ELSE
                          CASE
                              WHEN stone.is_diamond = 1 THEN
                              CASE
                                  WHEN dgm.average_carat IS NOT NULL THEN dgm.synthetic_rate * dgm.average_carat
                                  ELSE dgm.synthetic_rate * cz.value::double precision
                              END
                              ELSE dgm.synthetic_rate
                          END
                      END + COALESCE(cp_1.laber_charge, 0::double precision) + COALESCE(pm_1.without_band_metal_rate, 0::double precision) + COALESCE(pd_1.without_band_diamond_rate, 0::double precision)) AS without_band_price
                FROM config_products cp_1
                  LEFT JOIN diamond_group_masters dgm ON cp_1.center_diamond_group_id = dgm.id
                  LEFT JOIN carat_sizes cz ON cz.id::double precision = cp_1.center_dia_cts
                  LEFT JOIN gemstones stone ON stone.id = dgm.id_stone
                  LEFT JOIN productmetal pm_1 ON cp_1.id = pm_1.config_product_id
                  LEFT JOIN productdiamond pd_1 ON cp_1.id = pd_1.config_product_id
              )
      SELECT cp.id,
          pd.cpdo,
          pd.dia_stone,
          cp.sku,
          cp.product_title,
          cp.product_sort_des,
          cp.product_long_des,
          cp.slug,
          cp.head_no,
          cp.shank_no,
          cp.band_no,
          cp.ring_no,
          cp.head_type_id,
          cp.center_diamond_group_id,
          cp.shank_type_id,
          cp.side_setting_id,
          cp.product_type,
          cp.style_no,
          pd.diamond_weight,
          pd.with_band_diamond_weight,
          cp.center_dia_type,
          pm.metal_id,
          pm.karat_id,
          pm.metal_weight,
          pm.with_band_metal_weight,
          pp.with_band_price,
          pp.without_band_price,
          pp.center_dia_weight,
          cp.company_info_id
        FROM config_products cp
          LEFT JOIN productprice pp ON cp.id = pp.config_product_id
          LEFT JOIN productmetal pm ON cp.id = pm.config_product_id
          LEFT JOIN productdiamond pd ON cp.id = pd.config_product_id
      WITH DATA;

      ALTER TABLE IF EXISTS public.ring_three_stone_configurator_price_view
          OWNER TO postgres;


      CREATE INDEX idx_center_dia_type
          ON public.ring_three_stone_configurator_price_view USING btree
          (center_dia_type)
          TABLESPACE pg_default;
      CREATE INDEX idx_center_diamond_group_id
          ON public.ring_three_stone_configurator_price_view USING btree
          (center_diamond_group_id)
          TABLESPACE pg_default;
      CREATE INDEX idx_company_info_id
          ON public.ring_three_stone_configurator_price_view USING btree
          (company_info_id)
          TABLESPACE pg_default;
      CREATE INDEX idx_head_type_id
          ON public.ring_three_stone_configurator_price_view USING btree
          (head_type_id)
          TABLESPACE pg_default;
      CREATE INDEX idx_karat_id
          ON public.ring_three_stone_configurator_price_view USING btree
          (karat_id)
          TABLESPACE pg_default;
      CREATE INDEX idx_metal_id
          ON public.ring_three_stone_configurator_price_view USING btree
          (metal_id)
          TABLESPACE pg_default;
      CREATE INDEX idx_product_type
          ON public.ring_three_stone_configurator_price_view USING btree
          (product_type COLLATE pg_catalog."default")
          TABLESPACE pg_default;
      CREATE INDEX idx_ring_three_stone_configurator_price_view
          ON public.ring_three_stone_configurator_price_view USING btree
          (id)
          TABLESPACE pg_default;
      CREATE INDEX idx_shank_type_id
          ON public.ring_three_stone_configurator_price_view USING btree
          (shank_type_id)
          TABLESPACE pg_default;
      CREATE INDEX idx_side_setting_id
          ON public.ring_three_stone_configurator_price_view USING btree
          (side_setting_id)
          TABLESPACE pg_default;
            `)
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
