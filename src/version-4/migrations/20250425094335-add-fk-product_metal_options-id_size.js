
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_metal_options', {
      fields: ['id_size'],
      type: 'foreign key',
      name: 'fk_product_metal_options_id_size',
      references: {
        table: 'items_sizes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_metal_options', 'fk_product_metal_options_id_size');
  }
};
