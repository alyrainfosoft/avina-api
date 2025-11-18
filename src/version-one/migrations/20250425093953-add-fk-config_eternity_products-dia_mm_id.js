
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_eternity_products', {
      fields: ['dia_mm_id'],
      type: 'foreign key',
      name: 'fk_config_eternity_products_dia_mm_id',
      references: {
        table: 'mm_sizes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_eternity_products', 'fk_config_eternity_products_dia_mm_id');
  }
};
