
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('birthstone_product_diamond_options', {
      fields: ['id_clarity'],
      type: 'foreign key',
      name: 'fk_birthstone_product_diamond_options_id_clarity',
      references: {
        table: 'clarities',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('birthstone_product_diamond_options', 'fk_birthstone_product_diamond_options_id_clarity');
  }
};
