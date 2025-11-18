
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_test_products', {
      fields: ['shank_type_id'],
      type: 'foreign key',
      name: 'fk_config_test_products_shank_type_id',
      references: {
        table: 'shanks',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_test_products', 'fk_config_test_products_shank_type_id');
  }
};
