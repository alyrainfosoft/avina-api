
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gift_set_product_order_details', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_gift_set_product_order_details_product_id',
      references: {
        table: 'gift_set_products',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gift_set_product_order_details', 'fk_gift_set_product_order_details_product_id');
  }
};
