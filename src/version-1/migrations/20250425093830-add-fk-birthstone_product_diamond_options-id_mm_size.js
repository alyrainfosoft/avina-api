
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('birthstone_product_diamond_options', {
      fields: ['id_mm_size'],
      type: 'foreign key',
      name: 'fk_birthstone_product_diamond_options_id_mm_size',
      references: {
        table: 'mm_sizes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('birthstone_product_diamond_options', 'fk_birthstone_product_diamond_options_id_mm_size');
  }
};
