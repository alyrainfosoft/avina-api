
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_bracelet_products', {
      fields: ['product_length'],
      type: 'foreign key',
      name: 'fk_config_bracelet_products_product_length',
      references: {
        table: 'items_lengths',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_bracelet_products', 'fk_config_bracelet_products_product_length');
  }
};
