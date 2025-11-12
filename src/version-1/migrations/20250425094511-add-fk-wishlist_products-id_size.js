
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('wishlist_products', {
      fields: ['id_size'],
      type: 'foreign key',
      name: 'fk_wishlist_products_id_size',
      references: {
        table: 'items_sizes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('wishlist_products', 'fk_wishlist_products_id_size');
  }
};
