
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_products', {
      fields: ['side_setting_id'],
      type: 'foreign key',
      name: 'fk_config_products_side_setting_id',
      references: {
        table: 'side_setting_styles',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_products', 'fk_config_products_side_setting_id');
  }
};
