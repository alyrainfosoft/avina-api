'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `UPDATE "app_users" SET "is_super_admin" = true WHERE "id_role" = 0;`
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `UPDATE "app_users" SET "is_super_admin" = false WHERE "id_role" = 0;`
    );
  }
};
