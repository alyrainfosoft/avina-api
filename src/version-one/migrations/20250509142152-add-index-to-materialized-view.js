'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Creating an index on the materialized view
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_bracelet_configurator_price_view
      ON bracelet_configurator_price_view (id);
    `);
    // Creating an index on the materialized view
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_eternity_band_configurator_price_view
      ON eternity_band_configurator_price_view (id);
    `);
    // Creating an index on the materialized view
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_ring_three_stone_configurator_price_view
      ON ring_three_stone_configurator_price_view (id);
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the index if rolling back
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_bracelet_configurator_price_view;
    `);
    // Drop the index if rolling back
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_eternity_band_configurator_price_view;
    `);
    // Drop the index if rolling back
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_ring_three_stone_configurator_price_view;
    `);
  }
};
