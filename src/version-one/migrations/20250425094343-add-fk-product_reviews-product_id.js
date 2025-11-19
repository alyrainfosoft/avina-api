
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_reviews', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_product_reviews_product_id',
      references: {
        table: 'products',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_reviews', 'fk_product_reviews_product_id');
  }
};
