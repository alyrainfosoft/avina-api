
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_attribute_values', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_product_attribute_values_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_attribute_values', 'fk_product_attribute_values_created_by');
  }
};
