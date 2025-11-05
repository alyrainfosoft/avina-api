
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('wishlist_products', {
      fields: ['id_karat'],
      type: 'foreign key',
      name: 'fk_wishlist_products_id_karat',
      references: {
        table: 'gold_kts',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('wishlist_products', 'fk_wishlist_products_id_karat');
  }
};
