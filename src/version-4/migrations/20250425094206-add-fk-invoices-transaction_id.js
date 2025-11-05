
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('invoices', {
      fields: ['transaction_id'],
      type: 'foreign key',
      name: 'fk_invoices_transaction_id',
      references: {
        table: 'order_transactions',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('invoices', 'fk_invoices_transaction_id');
  }
};
