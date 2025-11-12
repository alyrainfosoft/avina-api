
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_metal_options', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_product_metal_options_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_metal_options', 'fk_product_metal_options_created_by');
  }
};
