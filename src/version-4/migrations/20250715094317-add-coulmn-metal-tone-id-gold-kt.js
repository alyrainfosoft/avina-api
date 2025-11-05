'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
        ALTER TABLE IF EXISTS public.gold_kts
        ADD COLUMN metal_tone_id jsonb;
      `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE IF EXISTS public.gold_kts
      DROP COLUMN IF EXISTS metal_tone_id;
    `);
  }
};
