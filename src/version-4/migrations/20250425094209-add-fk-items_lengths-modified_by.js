
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('items_lengths', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_items_lengths_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('items_lengths', 'fk_items_lengths_modified_by');
  }
};
