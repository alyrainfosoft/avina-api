'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `
      ALTER TABLE IF EXISTS public.stud_config_products DROP COLUMN IF EXISTS modified_at;

ALTER TABLE IF EXISTS public.stud_config_products DROP COLUMN IF EXISTS deleted_at;

ALTER TABLE IF EXISTS public.stud_config_products
    ADD COLUMN deleted_at timestamp with time zone;

ALTER TABLE IF EXISTS public.stud_config_products
    ADD COLUMN modified_at timestamp with time zone;
    `
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `
      ALTER TABLE IF EXISTS public.stud_config_products DROP COLUMN IF EXISTS modified_at;

ALTER TABLE IF EXISTS public.stud_config_products DROP COLUMN IF EXISTS deleted_at;

ALTER TABLE IF EXISTS public.stud_config_products
    ADD COLUMN deleted_at bigint;

ALTER TABLE IF EXISTS public.stud_config_products
    ADD COLUMN modified_at bigint;
    `
    );
  }
};
