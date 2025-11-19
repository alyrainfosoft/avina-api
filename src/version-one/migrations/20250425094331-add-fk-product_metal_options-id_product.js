
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_metal_options', {
      fields: ['id_product'],
      type: 'foreign key',
      name: 'fk_product_metal_options_id_product',
      references: {
        table: 'products',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_metal_options', 'fk_product_metal_options_id_product');
  }
};
