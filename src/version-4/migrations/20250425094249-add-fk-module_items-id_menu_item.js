
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('module_items', {
      fields: ['id_menu_item'],
      type: 'foreign key',
      name: 'fk_module_items_id_menu_item',
      references: {
        table: 'menu_items',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('module_items', 'fk_module_items_id_menu_item');
  }
};
