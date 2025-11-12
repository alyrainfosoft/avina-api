
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_product_diamonds', {
      fields: ['dia_mm_size'],
      type: 'foreign key',
      name: 'fk_config_product_diamonds_dia_mm_size',
      references: {
        table: 'mm_sizes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_product_diamonds', 'fk_config_product_diamonds_dia_mm_size');
  }
};
