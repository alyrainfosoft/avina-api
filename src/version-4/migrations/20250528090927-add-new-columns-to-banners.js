'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.addColumn('banners', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('banners', 'sub_title', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('banners', 'link_one', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('banners', 'link_two', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('banners', 'button_one', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('banners', 'button_two', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.removeColumn('banners', 'description');
    await queryInterface.removeColumn('banners', 'sub_title');
    await queryInterface.removeColumn('banners', 'link_one');
    await queryInterface.removeColumn('banners', 'link_two');
    await queryInterface.removeColumn('banners', 'button_one');
    await queryInterface.removeColumn('banners', 'button_two');
  }
};
