
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('items_sizes', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_items_sizes_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('items_sizes', 'fk_items_sizes_created_by');
  }
};
