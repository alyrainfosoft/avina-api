
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_categories', {
      fields: ['id_category'],
      type: 'foreign key',
      name: 'fk_product_categories_id_category',
      references: {
        table: 'categories',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_categories', 'fk_product_categories_id_category');
  }
};
