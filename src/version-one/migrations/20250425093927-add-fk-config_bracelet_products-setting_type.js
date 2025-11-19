
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_bracelet_products', {
      fields: ['setting_type'],
      type: 'foreign key',
      name: 'fk_config_bracelet_products_setting_type',
      references: {
        table: 'side_setting_styles',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_bracelet_products', 'fk_config_bracelet_products_setting_type');
  }
};
