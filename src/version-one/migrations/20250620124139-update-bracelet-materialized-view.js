'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP MATERIALIZED VIEW IF EXISTS public.bracelet_configurator_price_view;

      CREATE MATERIALIZED VIEW IF NOT EXISTS public.bracelet_configurator_price_view
      TABLESPACE pg_default
      AS
      SELECT config_bracelet_products.id,
          config_bracelet_products.product_type,
          config_bracelet_products.product_style,
          config_bracelet_products.product_length,
          config_bracelet_products.setting_type,
          config_bracelet_products.hook_type,
          config_bracelet_products.dia_total_wt,
          config_bracelet_products.style_no,
          config_bracelet_products.bracelet_no,
          config_bracelet_products.product_title,
          config_bracelet_products.sku,
          config_bracelet_products.slug,
          config_bracelet_products.product_sort_des,
          config_bracelet_products.product_long_des,
          config_bracelet_product_metals.id_metal,
          config_bracelet_product_metals.id_karat,
          config_bracelet_products.product_dia_type,
          config_bracelet_products.metal_weight_type,
          config_bracelet_products.company_info_id,
          carat_sizes.value AS total_diamond_wt,
              CASE
                  WHEN config_bracelet_product_metals.id_karat IS NULL THEN metal_masters.metal_rate * config_bracelet_product_metals.metal_wt + product_diamond_details.diamond_rate
                  ELSE metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.name::double precision / 24::double precision * config_bracelet_product_metals.metal_wt + config_bracelet_product_metals.labour_charge + product_diamond_details.diamond_rate
              END AS product_price,
          json_build_object('id', config_bracelet_product_metals.id, 'config_product_id', config_bracelet_product_metals.config_product_id, 'id_metal', config_bracelet_product_metals.id_metal, 'id_karat', config_bracelet_product_metals.id_karat, 'metal_name', metal_masters.name, 'karat_value', gold_kts.name, 'labour_charge', config_bracelet_product_metals.labour_charge, 'metal_wt', config_bracelet_product_metals.metal_wt) AS metals,
          jsonb_agg(DISTINCT jsonb_build_object('id', cbpdo.id, 'config_product_id', cbpdo.config_product_id, 'stone_type', cbpdo.stone_type, 'id_stone', cbpdo.id_stone, 'id_shape', cbpdo.id_shape, 'id_mm_size', cbpdo.id_mm_size, 'id_color', cbpdo.id_color, 'id_clarity', cbpdo.id_clarity, 'id_cut', cbpdo.id_cut, 'id_carat', cbpdo.id_carat, 'dia_wt', cbpdo.dia_wt, 'dia_count', cbpdo.dia_count, 'id_diamond_group_master', cbpdo.id_diamond_group_master, 'diamond_shape_name', pds.name, 'diamond_cut_value', cuts.value, 'diamond_clarity_value', clarities.value, 'diamond_color_name', colors.value, 'stone_name', psd.name, 'stone_sort_code', psd.sort_code, 'alternate_stone', cbpdo.alternate_stone)) AS diamond_details,
          sum(
              CASE
                  WHEN lower(cbpdo.stone_type::text) = 'gemstone'::text THEN 1
                  ELSE 0
              END) AS gemstone_count,
          sum(
              CASE
                  WHEN lower(cbpdo.stone_type::text) = 'diamond'::text THEN 1
                  ELSE 0
              END) AS diamond_count,
          sum(
              CASE
                  WHEN lower(cbpdo.alternate_stone::text) IS NOT NULL THEN 1
                  ELSE 0
              END) AS alternate_stone,
              CASE
                  WHEN sum(
                  CASE
                      WHEN lower(cbpdo.stone_type::text) = 'diamond'::text THEN 1
                      ELSE 0
                  END) >= 1 AND sum(
                  CASE
                      WHEN lower(cbpdo.stone_type::text) = 'gemstone'::text THEN 1
                      ELSE 0
                  END) <= 0 THEN 'diamond'::text
                  WHEN sum(
                  CASE
                      WHEN lower(cbpdo.stone_type::text) = 'diamond'::text THEN 1
                      ELSE 0
                  END) <= 0 AND sum(
                  CASE
                      WHEN lower(cbpdo.stone_type::text) = 'gemstone'::text THEN 1
                      ELSE 0
                  END) >= 1 THEN 'gemstone'::text
                  WHEN sum(
                  CASE
                      WHEN lower(cbpdo.stone_type::text) = 'diamond'::text THEN 1
                      ELSE 0
                  END) >= 1 AND sum(
                  CASE
                      WHEN lower(cbpdo.stone_type::text) = 'gemstone'::text THEN 1
                      ELSE 0
                  END) >= 1 THEN 'diamond-gemstone'::text
                  ELSE NULL::text
              END AS stone_combination_type
        FROM config_bracelet_products
          LEFT JOIN carat_sizes ON carat_sizes.id::double precision = config_bracelet_products.dia_total_wt
          JOIN config_bracelet_product_metals ON config_bracelet_product_metals.config_product_id = config_bracelet_products.id
          LEFT JOIN config_bracelet_product_diamonds cbpdo ON cbpdo.config_product_id = config_bracelet_products.id
          LEFT JOIN diamond_shapes pds ON pds.id = cbpdo.id_shape
          LEFT JOIN gemstones psd ON psd.id = cbpdo.id_stone
          LEFT JOIN colors ON colors.id = cbpdo.id_color
          LEFT JOIN clarities ON clarities.id = cbpdo.id_clarity
          LEFT JOIN cuts ON cuts.id = cbpdo.id_cut
          LEFT JOIN ( SELECT cpdo.config_product_id,
                  COALESCE(sum(pdgm.rate * (CASE WHEN pdgm.average_carat IS NOT NULL OR pdgm.average_carat != 0 THEN pdgm.average_carat ELSE cpdo.dia_count::double precision END) * cpdo.dia_wt), 0::double precision) AS diamond_rate
                FROM config_bracelet_product_diamonds cpdo
                  LEFT JOIN diamond_group_masters pdgm ON pdgm.id = cpdo.id_diamond_group_master
                GROUP BY cpdo.config_product_id) product_diamond_details ON product_diamond_details.config_product_id = config_bracelet_products.id
          LEFT JOIN metal_masters ON config_bracelet_product_metals.id_metal = metal_masters.id
          LEFT JOIN gold_kts ON config_bracelet_product_metals.id_karat = gold_kts.id
        GROUP BY config_bracelet_products.id, config_bracelet_product_metals.id_metal, config_bracelet_product_metals.id_karat, carat_sizes.value, metal_masters.id, config_bracelet_product_metals.id, product_diamond_details.diamond_rate, gold_kts.id
      WITH DATA;

      ALTER TABLE IF EXISTS public.bracelet_configurator_price_view
          OWNER TO postgres;


      CREATE INDEX idx_bracelet_configurator_price_view
          ON public.bracelet_configurator_price_view USING btree
          (id)
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
