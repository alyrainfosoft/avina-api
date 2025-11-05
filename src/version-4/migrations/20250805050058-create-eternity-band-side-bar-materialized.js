'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`CREATE MATERIALIZED VIEW IF NOT EXISTS public.mat_view_eternity_products
TABLESPACE pg_default
AS
 SELECT DISTINCT product_size,
 	product_length,
    dia_shape_id,
    dia_cts,
    side_setting_id,
    prod_dia_total_count,
        CASE
            WHEN (prod_dia_total_count::integer % 2) = 0 THEN 'true'::text
            ELSE 'false'::text
        END AS is_alternate,
    company_info_id,
    lower(product_type::text) AS product_type
   FROM config_eternity_products
WITH DATA;

ALTER TABLE IF EXISTS public.mat_view_eternity_products
    OWNER TO postgres;`)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP MATERIALIZED VIEW IF EXISTS public.mat_view_eternity_products`);
  }
};
