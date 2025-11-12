'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`update public.role_api_permissions set api_endpoint = '/admin/eternity-band/:product_id' where api_endpoint = '/admin/eternity-band/:id'`)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`update public.role_api_permissions set api_endpoint = '/admin/eternity-band/:id' where api_endpoint = '/admin/eternity-band/:product_id'`)
  }
};
