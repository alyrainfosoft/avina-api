
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('cart_products', {
      fields: ['id_metal'],
      type: 'foreign key',
      name: 'fk_cart_products_id_metal',
      references: {
        table: 'metal_masters',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('cart_products', 'fk_cart_products_id_metal');
  }
};
