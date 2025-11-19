'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
CREATE MATERIALIZED VIEW IF NOT EXISTS public.stud_config_product_price_view
TABLESPACE pg_default
AS
 SELECT scp.id,
    scp.setting_type,
    scp.center_dia_shape,
    scp.center_dia_wt,
    scp.center_dia_mm_size,
    scp.center_dia_count,
    scp.style_no,
    scp.huggies_no,
    scp.drop_no,
    scp.sort_description,
    scp.long_description,
    scp.labour_charge,
    scp.other_charge,
    scp.is_active,
    scp.product_style,
    scp.huggies_setting_type,
    scp.name,
    scp.sku,
    scp.slug,
    scp.company_info_id,
    sm.metal_id,
    sm.karat_id,
    sm.metal_wt,
    mm.metal_rate,
    mm.calculate_rate,
    gk.name AS karat_name,
    cs.value AS center_dia_wt_value,
    ds.name AS center_dia_shape_name,
    h.name AS setting_type_name,
    ms.value AS mm_size_value,
    sss.name AS huggies_setting_name,
    COALESCE(sd.total_dia_weight, 0::double precision) AS side_dia_weight,
    COALESCE(sd.total_dia_count, 0::numeric) AS side_dia_count,
    cs.value::double precision * scp.center_dia_count::double precision + COALESCE(sd.total_dia_weight, 0::double precision) AS total_weight,
    scp.center_dia_count::double precision + COALESCE(sd.total_dia_count::double precision, 0::double precision) AS total_count,
    sd.all_diamonds,
        CASE
            WHEN sm.karat_id IS NULL THEN mm.metal_rate * sm.metal_wt + COALESCE(scp.labour_charge, 0::double precision) + COALESCE(scp.other_charge, 0::double precision)
            ELSE mm.metal_rate / mm.calculate_rate * gk.name::double precision / 24::double precision * sm.metal_wt + COALESCE(scp.labour_charge, 0::double precision) + COALESCE(scp.other_charge, 0::double precision)
        END AS metal_price
   FROM stud_config_products scp
     LEFT JOIN stud_metals sm ON sm.stud_id = scp.id
     LEFT JOIN metal_masters mm ON mm.id = sm.metal_id
     LEFT JOIN gold_kts gk ON gk.id = sm.karat_id
     LEFT JOIN carat_sizes cs ON cs.id = scp.center_dia_wt
     LEFT JOIN diamond_shapes ds ON ds.id = scp.center_dia_shape
     LEFT JOIN heads h ON h.id = scp.setting_type
     LEFT JOIN mm_sizes ms ON ms.id = scp.center_dia_mm_size
     LEFT JOIN side_setting_styles sss ON sss.id = scp.huggies_setting_type
     LEFT JOIN ( SELECT sd_1.stud_id,
            sum(sd_1.dia_weight * sd_1.dia_count::double precision) AS total_dia_weight,
            sum(sd_1.dia_count) AS total_dia_count,
            json_agg(json_build_object('id', sd_1.id, 'shape', sd_1.dia_shape, 'shape_name', ds_1.name, 'mm_size', sd_1.dia_mm_size, 'mm_size_value', ms_1.value, 'count', sd_1.dia_count, 'weight', sd_1.dia_weight, 'side_dia_type', sd_1.side_dia_prod_type)) AS all_diamonds
           FROM stud_diamonds sd_1
             LEFT JOIN diamond_shapes ds_1 ON ds_1.id = sd_1.dia_shape
             LEFT JOIN mm_sizes ms_1 ON ms_1.id = sd_1.dia_mm_size
          GROUP BY sd_1.stud_id) sd ON sd.stud_id = scp.id
  WHERE scp.is_deleted = '0'::"bit"
WITH DATA;

ALTER TABLE IF EXISTS public.stud_config_product_price_view
    OWNER TO postgres;
      `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `
        DROP MATERIALIZED VIEW IF EXISTS public.stud_config_product_price_view;
      `
    )
  }
};
