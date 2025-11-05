'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`ALTER TABLE public.metadata_details
    ALTER COLUMN other_meta_data TYPE text COLLATE pg_catalog."default";`)
  },

  async down (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`ALTER TABLE public.metadata_details
    ALTER COLUMN other_meta_data TYPE character varying COLLATE pg_catalog."default";`)

  }
};
