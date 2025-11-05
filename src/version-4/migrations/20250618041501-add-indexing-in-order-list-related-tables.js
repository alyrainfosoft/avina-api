'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

           await queryInterface.sequelize.query(`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
           `);
       await queryInterface.sequelize.query(`
   CREATE INDEX IF NOT EXISTS idx_orders_order_total_text
    ON public.orders USING btree
    ((order_total::text) COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_orders_order_status
    ON public.orders USING btree
    (order_status ASC NULLS LAST)
    TABLESPACE pg_default;
    `);

    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_orders_order_number_trgm
    ON public.orders USING gin
    (order_number COLLATE pg_catalog."default" gin_trgm_ops)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_orders_order_number
    ON public.orders USING btree
    (order_number COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_orders_company_user_date
    ON public.orders USING btree
    (company_info_id ASC NULLS LAST, user_id ASC NULLS LAST, order_date ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_center_dia_shape_id
    ON public.config_products USING btree
    (center_dia_shape_id ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_config_products_id_title_slug_sku
    ON public.config_products USING btree
    (id ASC NULLS LAST, product_title COLLATE pg_catalog."default" ASC NULLS LAST, slug COLLATE pg_catalog."default" ASC NULLS LAST, sku COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_order_details_order_id
    ON public.order_details USING btree
    (order_id ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_order_details_product_id
    ON public.order_details USING btree
    (product_id ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_order_details_product_paid
    ON public.order_details USING btree
    (product_id ASC NULLS LAST, payment_status ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_products_name_slug_sku
    ON public.products USING btree
    (name COLLATE pg_catalog."default" ASC NULLS LAST, slug COLLATE pg_catalog."default" ASC NULLS LAST, sku COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);

    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_products_name_trgm
    ON public.products USING gin
    (name COLLATE pg_catalog."default" gin_trgm_ops)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_gift_set_products_id_title_slug_sku
    ON public.gift_set_products USING btree
    (id ASC NULLS LAST, product_title COLLATE pg_catalog."default" ASC NULLS LAST, slug COLLATE pg_catalog."default" ASC NULLS LAST, sku COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_birthstone_products_id_name_slug_sku
    ON public.birthstone_products USING btree
    (id ASC NULLS LAST, name COLLATE pg_catalog."default" ASC NULLS LAST, slug COLLATE pg_catalog."default" ASC NULLS LAST, sku COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);


    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_cebp_dia_shape_id
    ON public.config_eternity_products USING btree
    (dia_shape_id ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_config_eternity_products_id_title_slug_sku
    ON public.config_eternity_products USING btree
    (id ASC NULLS LAST, product_title COLLATE pg_catalog."default" ASC NULLS LAST, slug COLLATE pg_catalog."default" ASC NULLS LAST, sku COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_config_bracelet_products_id_title_slug_sku
    ON public.config_bracelet_products USING btree
    (id ASC NULLS LAST, product_title COLLATE pg_catalog."default" ASC NULLS LAST, slug COLLATE pg_catalog."default" ASC NULLS LAST, sku COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_product_diamond_options_id_product
    ON public.product_diamond_options USING btree
    (id_product ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_diamond_group_masters_id
    ON public.diamond_group_masters USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_diamond_group_masters_idone
    ON public.diamond_group_masters USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_diamond_shapes_id_name
    ON public.diamond_shapes USING btree
    (id ASC NULLS LAST, name COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);

    await queryInterface.sequelize.query(`
 CREATE INDEX IF NOT EXISTS idx_diamond_shapes_name
    ON public.diamond_shapes USING btree
    (name COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
    `);
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_orders_order_total_text;
    `);

     await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_orders_order_status;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_orders_order_number_trgm;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_orders_order_number;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_orders_company_user_date;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_center_dia_shape_id;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_config_products_id_title_slug_sku;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_order_details_order_id;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_order_details_product_id;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_order_details_product_paid;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_products_name_slug_sku;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_products_name_trgm;

    `);

    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_gift_set_products_id_title_slug_sku;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_birthstone_products_id_name_slug_sku;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_cebp_dia_shape_id;

    `);

    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_config_eternity_products_id_title_slug_sku;

    `);
    await queryInterface.sequelize.query(`
  DROP INDEX IF EXISTS public.idx_config_bracelet_products_id_title_slug_sku;

    `);
    await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_product_diamond_options_id_product;

    `);
    await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_diamond_group_masters_id;

    `);
    await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_diamond_group_masters_idone;

    `);
    await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_diamond_shapes_id_name;

    `);
    await queryInterface.sequelize.query(`
 DROP INDEX IF EXISTS public.idx_diamond_shapes_name;
    `);
  }
};
