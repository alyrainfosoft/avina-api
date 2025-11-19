
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_eternity_products', {
      fields: ['diamond_group_id'],
      type: 'foreign key',
      name: 'fk_config_eternity_products_diamond_group_id',
      references: {
        table: 'diamond_group_masters',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_eternity_products', 'fk_config_eternity_products_diamond_group_id');
  }
};
