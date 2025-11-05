
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('module_items', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_module_items_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('module_items', 'fk_module_items_modified_by');
  }
};
