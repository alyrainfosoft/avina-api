'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_pdo_id_shape
      ON public.product_list_view USING gin
      (jsonb_path_query_array(pdo, '$[*]."id_shape"'::jsonpath))
      TABLESPACE pg_default;`
    )

    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_product_categories_gin
        ON public.product_list_view USING gin
        (product_categories jsonb_path_ops)
        TABLESPACE pg_default;`
    )
    
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_product_list_company_info_id
      ON public.product_list_view USING btree
      (company_info_id ASC NULLS LAST)
      TABLESPACE pg_default;`
    )
      await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_product_list_company_parent
    ON public.product_list_view USING btree
    (company_info_id ASC NULLS LAST, parent_id ASC NULLS LAST)
    TABLESPACE pg_default;`
      )
    
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_product_pdo_gin
    ON public.product_list_view USING gin
    (pdo jsonb_path_ops)
    TABLESPACE pg_default;`
    )
    
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_product_pmo_gin
    ON public.product_list_view USING gin
    (pmo jsonb_path_ops)
    TABLESPACE pg_default;`
    )

    await queryInterface.sequelize.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_product_view_id
    ON public.product_list_view USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;`
    )
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
