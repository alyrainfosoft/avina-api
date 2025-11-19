
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('cart_products', {
      fields: ['id_karat'],
      type: 'foreign key',
      name: 'fk_cart_products_id_karat',
      references: {
        table: 'gold_kts',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('cart_products', 'fk_cart_products_id_karat');
  }
};
