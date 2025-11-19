'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('banners', 'title_color', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('banners', 'sub_title_color', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('banners', 'description_color', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('banners', 'button_color', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('banners', 'button_text_color', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('banners', 'is_button_transparent', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('banners', 'button_hover_color', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('banners', 'button_text_hover_color', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add 'the_process' to log_type
    await queryInterface.sequelize.query(`
      ALTER TYPE log_type ADD VALUE IF NOT EXISTS 'the_process';
    `);

    // Add 'new_arrive_product' to log_type
    await queryInterface.sequelize.query(`
      ALTER TYPE log_type ADD VALUE IF NOT EXISTS 'new_arrive_product';
    `);

    // Add 'new_arrive_product' to log_type
    await queryInterface.sequelize.query(`
ALTER TABLE IF EXISTS public.banners
    ADD COLUMN id_bg_image integer;
    `);

    // Add 'title_color' to home_subs
    await queryInterface.sequelize.query(`
ALTER TABLE IF EXISTS public.home_subs
    ADD COLUMN title_color character varying;
    `);

    // Add 'description_color' to home_subs
    await queryInterface.sequelize.query(`
ALTER TABLE IF EXISTS public.home_subs
    ADD COLUMN description_color character varying;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('banners', 'title_color');
    await queryInterface.removeColumn('banners', 'sub_title_color');
    await queryInterface.removeColumn('banners', 'description_color');
    await queryInterface.removeColumn('banners', 'button_color');
    await queryInterface.removeColumn('banners', 'button_text_color');
    await queryInterface.removeColumn('banners', 'is_button_transparent');
    await queryInterface.removeColumn('banners', 'button_hover_color');
    await queryInterface.removeColumn('banners', 'button_text_hover_color');
    await queryInterface.removeColumn('banners', 'id_bg_image');
    await queryInterface.removeColumn('home_subs', 'title_color');
    await queryInterface.removeColumn('home_subs', 'description_color');

  }
};
