'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('banners', 'product_ids', {
      type: Sequelize.JSONB,
      allowNull: true, // or false if needed
    });
     // Wrap in IF NOT EXISTS so repeated deployments don’t explode
    await queryInterface.sequelize.query(`
      ALTER TYPE "public"."log_type"
      ADD VALUE IF NOT EXISTS 'template_one_product_section'
      AFTER 'template_four_journal';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('banners', 'product_ids');
  }
};
