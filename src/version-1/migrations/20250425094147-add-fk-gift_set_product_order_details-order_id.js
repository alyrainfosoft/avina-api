
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gift_set_product_order_details', {
      fields: ['order_id'],
      type: 'foreign key',
      name: 'fk_gift_set_product_order_details_order_id',
      references: {
        table: 'gift_set_product_orders',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gift_set_product_order_details', 'fk_gift_set_product_order_details_order_id');
  }
};
