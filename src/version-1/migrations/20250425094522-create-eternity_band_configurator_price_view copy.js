
'use strict';
// migrations/20250426120000-add-materialized-view.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    
        CREATE MATERIALIZED VIEW IF NOT EXISTS public.eternity_band_configurator_price_view
        TABLESPACE pg_default
        AS
         SELECT cebp.id,
            cebp.side_setting_id,
            cebp.product_title,
            cebp.product_sort_des,
            cebp.product_long_des,
            cebp.sku,
            cebp.slug,
            cebp.dia_cts,
            cebp.dia_shape_id,
            cebp.dia_clarity_id,
            cebp.dia_cut_id,
            cebp.dia_mm_id,
            cebp.dia_color,
            cebp.diamond_group_id,
            cebp.product_size,
            cebp.product_length,
            cebp.product_combo_type,
            cebp.style_no,
            cebp.id_stone,
            cebp.dia_type,
            cebp.labour_charge,
            cebp.other_charge,
            cebp.prod_dia_total_count,
            cebp.alternate_dia_count,
            cebp.dia_count,
            cebp.company_info_id,
            cebpmo.karat_id,
            cebpmo.metal_id,
            cebpdo.dia_cuts AS alt_dia_cuts,
            cebpdo.dia_stone AS alt_dia_stone,
            cebpdo.dia_cts AS alt_dia_cts,
            cebpdo.dia_shape AS alt_dia_shape,
            cebpdo.diamond_type AS alt_diamond_type,
            cebpdo.dia_weight AS alt_dia_weight,
            cebp.prod_dia_total_count * carat_sizes.value::double precision AS diamond_weight,
            cebpdo.dia_color AS alt_dia_color,
            cebpdo.dia_clarity AS alt_dia_clarity,
            cebpmo.metal_wt AS metal_weight,
            cebpdo.id_diamond_group AS alt_id_diamond_group,
            json_build_object('id', cebpmo.id, 'config_eternity_id', cebpmo.config_eternity_id, 'karat_id', cebpmo.karat_id, 'metal_id', cebpmo.metal_id, 'metal_wt', cebpmo.metal_wt, 'karat_value', gold_kts.name, 'metal_rate', metal_masters.metal_rate, 'calculate_rate', metal_masters.calculate_rate) AS metal,
                CASE
                    WHEN cebpdo.dia_stone IS NOT NULL THEN json_build_object('id', cebpdo.id, 'config_eternity_product_id', cebpdo.config_eternity_product_id, 'dia_clarity', cebpdo.dia_clarity, 'dia_color', cebpdo.dia_color, 'dia_count', cebpdo.dia_count, 'dia_cts', cebpdo.dia_cts, 'dia_cuts', cebpdo.dia_cuts, 'dia_mm_size', cebpdo.dia_mm_size, 'dia_shape', cebpdo.dia_shape, 'dia_stone', cebpdo.dia_stone, 'dia_weight', cebpdo.dia_weight, 'diamond_type', cebpdo.diamond_type, 'id_diamond_group', cebpdo.id_diamond_group, 'rate', dgmp.rate)
                    ELSE NULL::json
                END AS diamonds,
                CASE
                    WHEN cebpmo.karat_id IS NULL THEN
                    CASE
                        WHEN cebp.product_combo_type = 1 OR cebp.product_combo_type = 3 THEN COALESCE(
                        CASE
                            WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                            ELSE dgm.rate
                        END * cebp.dia_count * carat_sizes.value::double precision, 0::double precision)
                        ELSE COALESCE(
                        CASE
                            WHEN cebp.dia_type = 2 THEN dgmp.synthetic_rate
                            ELSE dgmp.rate
                        END * cebpdo.dia_count::double precision * carat_size_sd.value::double precision, 0::double precision) + COALESCE(
                        CASE
                            WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                            ELSE dgm.rate
                        END * cebp.dia_count * carat_sizes.value::double precision, 0::double precision)
                    END + metal_masters.metal_rate * cebpmo.metal_wt + COALESCE(cebp.labour_charge, 0::double precision) + COALESCE(cebp.other_charge, 0::double precision)
                    ELSE
                    CASE
                        WHEN cebp.product_combo_type = 1 OR cebp.product_combo_type = 3 THEN COALESCE(
                        CASE
                            WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                            ELSE dgm.rate
                        END * cebp.prod_dia_total_count * carat_sizes.value::double precision, 0::double precision)
                        ELSE COALESCE(
                        CASE
                            WHEN cebp.dia_type = 2 THEN dgmp.synthetic_rate
                            ELSE dgmp.rate
                        END * cebpdo.dia_count::double precision * carat_size_sd.value::double precision, 0::double precision) + COALESCE(
                        CASE
                            WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                            ELSE dgm.rate
                        END * cebp.alternate_dia_count * carat_sizes.value::double precision, 0::double precision)
                    END + metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.name::double precision / 24::double precision * cebpmo.metal_wt + COALESCE(cebp.labour_charge, 0::double precision) + COALESCE(cebp.other_charge, 0::double precision)
                END AS calculated_value
           FROM config_eternity_products cebp
             JOIN config_eternity_product_metals cebpmo ON cebpmo.config_eternity_id = cebp.id
             LEFT JOIN diamond_group_masters dgm ON dgm.id = cebp.diamond_group_id
             LEFT JOIN carat_sizes ON dgm.id_carat = carat_sizes.id
             LEFT JOIN metal_masters ON metal_masters.id = cebpmo.metal_id
             LEFT JOIN gold_kts ON gold_kts.id = cebpmo.karat_id
             LEFT JOIN config_eternity_product_diamonds cebpdo ON cebpdo.config_eternity_product_id = cebp.id AND cebpdo.is_deleted = '0'
             LEFT JOIN diamond_group_masters dgmp ON dgmp.id = cebpdo.id_diamond_group
             LEFT JOIN carat_sizes carat_size_sd ON dgmp.id_carat = carat_size_sd.id
          WHERE cebp.is_deleted = '0'
        WITH DATA;
        
        ALTER TABLE IF EXISTS public.eternity_band_configurator_price_view
            OWNER TO postgres;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the materialized view in the down method
    await queryInterface.sequelize.query(`
      DROP MATERIALIZED VIEW IF EXISTS eternity_band_configurator_price_view;
    `);
  }
};
