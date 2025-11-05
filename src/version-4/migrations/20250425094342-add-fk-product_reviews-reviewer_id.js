
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_reviews', {
      fields: ['reviewer_id'],
      type: 'foreign key',
      name: 'fk_product_reviews_reviewer_id',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_reviews', 'fk_product_reviews_reviewer_id');
  }
};
