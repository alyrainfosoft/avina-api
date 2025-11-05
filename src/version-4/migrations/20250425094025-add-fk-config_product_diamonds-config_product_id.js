
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_product_diamonds', {
      fields: ['config_product_id'],
      type: 'foreign key',
      name: 'fk_config_product_diamonds_config_product_id',
      references: {
        table: 'config_products',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_product_diamonds', 'fk_config_product_diamonds_config_product_id');
  }
};
