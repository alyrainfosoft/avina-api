
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_categories', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_product_categories_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_categories', 'fk_product_categories_modified_by');
  }
};
