
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('orders', {
      fields: ['coupon_id'],
      type: 'foreign key',
      name: 'fk_orders_coupon_id',
      references: {
        table: 'coupons',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('orders', 'fk_orders_coupon_id');
  }
};
