
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gift_product_order_transactions', {
      fields: ['order_id'],
      type: 'foreign key',
      name: 'fk_gift_product_order_transactions_order_id',
      references: {
        table: 'orders',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gift_product_order_transactions', 'fk_gift_product_order_transactions_order_id');
  }
};
