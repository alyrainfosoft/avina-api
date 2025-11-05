
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_categories', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_product_categories_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_categories', 'fk_product_categories_created_by');
  }
};
