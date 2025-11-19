
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('order_transactions', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_order_transactions_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('order_transactions', 'fk_order_transactions_created_by');
  }
};
