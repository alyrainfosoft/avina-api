
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('theme_attributes', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_theme_attributes_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('theme_attributes', 'fk_theme_attributes_created_by');
  }
};
