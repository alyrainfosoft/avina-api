
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_diamond_options', {
      fields: ['id_color'],
      type: 'foreign key',
      name: 'fk_product_diamond_options_id_color',
      references: {
        table: 'colors',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_diamond_options', 'fk_product_diamond_options_id_color');
  }
};
