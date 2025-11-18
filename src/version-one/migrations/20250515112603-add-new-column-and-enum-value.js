'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.sequelize.query(`
      ALTER TYPE public.log_type
    ADD VALUE 'template_seven_products' AFTER 'email_template';
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.template_seven
    ADD COLUMN product_ids json;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('template_seven', 'product_ids');
  }
};
