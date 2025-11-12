
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('role_permissions', {
      fields: ['id_menu_item'],
      type: 'foreign key',
      name: 'fk_role_permissions_id_menu_item',
      references: {
        table: 'menu_items',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('role_permissions', 'fk_role_permissions_id_menu_item');
  }
};
