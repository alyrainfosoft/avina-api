
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_bracelet_products', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_config_bracelet_products_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_bracelet_products', 'fk_config_bracelet_products_created_by');
  }
};
