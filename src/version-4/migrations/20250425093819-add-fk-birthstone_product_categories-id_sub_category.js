
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('birthstone_product_categories', {
      fields: ['id_sub_category'],
      type: 'foreign key',
      name: 'fk_birthstone_product_categories_id_sub_category',
      references: {
        table: 'categories',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('birthstone_product_categories', 'fk_birthstone_product_categories_id_sub_category');
  }
};
