
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_product_diamonds', {
      fields: ['dia_shape'],
      type: 'foreign key',
      name: 'fk_config_product_diamonds_dia_shape',
      references: {
        table: 'diamond_shapes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_product_diamonds', 'fk_config_product_diamonds_dia_shape');
  }
};
