
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('order_transactions', {
      fields: ['order_id'],
      type: 'foreign key',
      name: 'fk_order_transactions_order_id',
      references: {
        table: 'orders',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('order_transactions', 'fk_order_transactions_order_id');
  }
};
