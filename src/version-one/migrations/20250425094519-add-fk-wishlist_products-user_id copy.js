
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('wishlist_products', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_wishlist_products_user_id',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('wishlist_products', 'fk_wishlist_products_user_id');
  }
};
