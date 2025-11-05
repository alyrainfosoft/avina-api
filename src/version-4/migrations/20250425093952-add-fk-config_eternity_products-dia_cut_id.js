
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_eternity_products', {
      fields: ['dia_cut_id'],
      type: 'foreign key',
      name: 'fk_config_eternity_products_dia_cut_id',
      references: {
        table: 'cuts',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_eternity_products', 'fk_config_eternity_products_dia_cut_id');
  }
};
