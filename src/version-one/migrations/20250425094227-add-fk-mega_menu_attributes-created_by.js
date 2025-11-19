
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('mega_menu_attributes', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_mega_menu_attributes_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('mega_menu_attributes', 'fk_mega_menu_attributes_created_by');
  }
};
