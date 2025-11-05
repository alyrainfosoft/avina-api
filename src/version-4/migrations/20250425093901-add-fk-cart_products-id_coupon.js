
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('cart_products', {
      fields: ['id_coupon'],
      type: 'foreign key',
      name: 'fk_cart_products_id_coupon',
      references: {
        table: 'coupons',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('cart_products', 'fk_cart_products_id_coupon');
  }
};
