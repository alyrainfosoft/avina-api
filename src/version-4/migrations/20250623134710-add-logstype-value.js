'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "log_type"
      ADD VALUE IF NOT EXISTS 'company_info_update_by_client';
    `);
  },

  down: async (queryInterface, Sequelize) => {
  }
};
