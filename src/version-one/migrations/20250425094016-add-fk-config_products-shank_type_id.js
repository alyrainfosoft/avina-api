
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_products', {
      fields: ['shank_type_id'],
      type: 'foreign key',
      name: 'fk_config_products_shank_type_id',
      references: {
        table: 'shanks',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_products', 'fk_config_products_shank_type_id');
  }
};
