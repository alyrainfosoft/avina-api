
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_diamond_options', {
      fields: ['id_clarity'],
      type: 'foreign key',
      name: 'fk_product_diamond_options_id_clarity',
      references: {
        table: 'clarities',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_diamond_options', 'fk_product_diamond_options_id_clarity');
  }
};
