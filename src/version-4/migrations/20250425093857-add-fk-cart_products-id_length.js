
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('cart_products', {
      fields: ['id_length'],
      type: 'foreign key',
      name: 'fk_cart_products_id_length',
      references: {
        table: 'items_lengths',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('cart_products', 'fk_cart_products_id_length');
  }
};
