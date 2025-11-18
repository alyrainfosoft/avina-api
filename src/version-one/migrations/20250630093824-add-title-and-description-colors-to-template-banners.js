'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('template_banners', 'title_color', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Hex code or color name for the title'
    });
    await queryInterface.addColumn('template_banners', 'sub_title_color', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Hex code or color name for the subtitle'
    });
    await queryInterface.addColumn('template_banners', 'description_color', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Hex code or color name for the description'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('template_banners', 'title_color');
    await queryInterface.removeColumn('template_banners', 'sub_title_color');
    await queryInterface.removeColumn('template_banners', 'description_color');
  }
};
