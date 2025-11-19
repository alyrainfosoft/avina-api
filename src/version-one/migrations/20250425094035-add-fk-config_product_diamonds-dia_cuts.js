
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_product_diamonds', {
      fields: ['dia_cuts'],
      type: 'foreign key',
      name: 'fk_config_product_diamonds_dia_cuts',
      references: {
        table: 'cuts',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_product_diamonds', 'fk_config_product_diamonds_dia_cuts');
  }
};
