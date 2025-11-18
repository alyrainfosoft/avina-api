
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('invoices', {
      fields: ['order_id'],
      type: 'foreign key',
      name: 'fk_invoices_order_id',
      references: {
        table: 'orders',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('invoices', 'fk_invoices_order_id');
  }
};
