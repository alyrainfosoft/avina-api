
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_eternity_products', {
      fields: ['id_stone'],
      type: 'foreign key',
      name: 'fk_config_eternity_products_id_stone',
      references: {
        table: 'gemstones',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_eternity_products', 'fk_config_eternity_products_id_stone');
  }
};
