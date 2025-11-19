
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_bracelet_products', {
      fields: ['hook_type'],
      type: 'foreign key',
      name: 'fk_config_bracelet_products_hook_type',
      references: {
        table: 'hook_types',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_bracelet_products', 'fk_config_bracelet_products_hook_type');
  }
};
