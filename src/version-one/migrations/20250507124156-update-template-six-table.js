'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('template_six', 'mobile_banner_image',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'images',
          key: 'id'
        }
      });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
