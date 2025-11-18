
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_cart_products', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_config_cart_products_product_id',
      references: {
        table: 'config_products',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_cart_products', 'fk_config_cart_products_product_id');
  }
};
