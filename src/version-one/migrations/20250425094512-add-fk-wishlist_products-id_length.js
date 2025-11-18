
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('wishlist_products', {
      fields: ['id_length'],
      type: 'foreign key',
      name: 'fk_wishlist_products_id_length',
      references: {
        table: 'items_lengths',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('wishlist_products', 'fk_wishlist_products_id_length');
  }
};
