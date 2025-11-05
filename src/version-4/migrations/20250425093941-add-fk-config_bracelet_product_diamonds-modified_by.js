
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_bracelet_product_diamonds', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_config_bracelet_product_diamonds_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_bracelet_product_diamonds', 'fk_config_bracelet_product_diamonds_modified_by');
  }
};
