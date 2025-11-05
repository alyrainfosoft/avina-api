
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('menu_items', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_menu_items_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('menu_items', 'fk_menu_items_created_by');
  }
};
