
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_eternity_product_diamonds', {
      fields: ['config_eternity_product_id'],
      type: 'foreign key',
      name: 'fk_config_eternity_product_diamonds_config_eternity_product_id',
      references: {
        table: 'config_eternity_products',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_eternity_product_diamonds', 'fk_config_eternity_product_diamonds_config_eternity_product_id');
  }
};
