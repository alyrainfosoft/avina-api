
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_eternity_products', {
      fields: ['dia_shape_id'],
      type: 'foreign key',
      name: 'fk_config_eternity_products_dia_shape_id',
      references: {
        table: 'diamond_shapes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_eternity_products', 'fk_config_eternity_products_dia_shape_id');
  }
};
