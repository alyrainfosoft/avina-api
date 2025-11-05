
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gift_set_product_orders', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_gift_set_product_orders_user_id',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gift_set_product_orders', 'fk_gift_set_product_orders_user_id');
  }
};
