
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_eternity_product_diamonds', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_config_eternity_product_diamonds_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_eternity_product_diamonds', 'fk_config_eternity_product_diamonds_created_by');
  }
};
