
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_bracelet_product_diamonds', {
      fields: ['id_shape'],
      type: 'foreign key',
      name: 'fk_config_bracelet_product_diamonds_id_shape',
      references: {
        table: 'diamond_shapes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_bracelet_product_diamonds', 'fk_config_bracelet_product_diamonds_id_shape');
  }
};
