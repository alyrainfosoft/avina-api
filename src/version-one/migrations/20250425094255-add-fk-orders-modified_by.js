
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('orders', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_orders_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('orders', 'fk_orders_modified_by');
  }
};
