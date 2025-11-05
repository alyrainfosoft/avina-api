
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_eternity_products', {
      fields: ['side_setting_id'],
      type: 'foreign key',
      name: 'fk_config_eternity_products_side_setting_id',
      references: {
        table: 'side_setting_styles',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_eternity_products', 'fk_config_eternity_products_side_setting_id');
  }
};
