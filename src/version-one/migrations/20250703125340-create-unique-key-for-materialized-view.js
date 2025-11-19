'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX CONCURRENTLY idx_unique_product_view_id
      ON product_list_view(id);
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX CONCURRENTLY idx_unique_ring_three_stone_configurator_view_id
      ON ring_three_stone_configurator_price_view(id);
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX CONCURRENTLY idx_unique_eternity_band_configurator_price_view_id
      ON eternity_band_configurator_price_view(id);
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX CONCURRENTLY idx_unique_bracelet_configurator_price_view_id
      ON bracelet_configurator_price_view(id);
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX CONCURRENTLY idx_unique_stud_config_product_price_view_id
      ON stud_config_product_price_view(id);
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS public.idx_unique_product_view_id;
    `);
    await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS public.idx_unique_ring_three_stone_configurator_view_id;
    `);
    await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS public.idx_unique_eternity_band_configurator_price_view_id;
    `);
    await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS public.idx_unique_bracelet_configurator_price_view_id;
    `);
    await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS public.idx_unique_stud_config_product_price_view_id;
    `);
  }
};
