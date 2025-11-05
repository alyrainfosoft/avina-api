
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_eternity_product_diamonds', {
      fields: ['dia_stone'],
      type: 'foreign key',
      name: 'fk_config_eternity_product_diamonds_dia_stone',
      references: {
        table: 'gemstones',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_eternity_product_diamonds', 'fk_config_eternity_product_diamonds_dia_stone');
  }
};
