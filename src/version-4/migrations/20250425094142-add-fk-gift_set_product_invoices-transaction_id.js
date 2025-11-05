
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gift_set_product_invoices', {
      fields: ['transaction_id'],
      type: 'foreign key',
      name: 'fk_gift_set_product_invoices_transaction_id',
      references: {
        table: 'order_transactions',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gift_set_product_invoices', 'fk_gift_set_product_invoices_transaction_id');
  }
};
