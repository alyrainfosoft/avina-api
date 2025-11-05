
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_bracelet_product_diamonds', {
      fields: ['id_clarity'],
      type: 'foreign key',
      name: 'fk_config_bracelet_product_diamonds_id_clarity',
      references: {
        table: 'clarities',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_bracelet_product_diamonds', 'fk_config_bracelet_product_diamonds_id_clarity');
  }
};
