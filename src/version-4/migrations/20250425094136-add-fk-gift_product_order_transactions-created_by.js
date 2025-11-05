
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gift_product_order_transactions', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_gift_product_order_transactions_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gift_product_order_transactions', 'fk_gift_product_order_transactions_created_by');
  }
};
