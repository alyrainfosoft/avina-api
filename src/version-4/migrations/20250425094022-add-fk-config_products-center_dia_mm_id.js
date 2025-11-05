
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_products', {
      fields: ['center_dia_mm_id'],
      type: 'foreign key',
      name: 'fk_config_products_center_dia_mm_id',
      references: {
        table: 'mm_sizes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_products', 'fk_config_products_center_dia_mm_id');
  }
};
