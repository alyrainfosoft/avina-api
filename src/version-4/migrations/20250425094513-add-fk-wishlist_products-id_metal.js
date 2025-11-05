
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('wishlist_products', {
      fields: ['id_metal'],
      type: 'foreign key',
      name: 'fk_wishlist_products_id_metal',
      references: {
        table: 'metal_masters',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('wishlist_products', 'fk_wishlist_products_id_metal');
  }
};
