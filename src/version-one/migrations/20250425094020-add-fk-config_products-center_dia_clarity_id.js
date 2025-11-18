
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_products', {
      fields: ['center_dia_clarity_id'],
      type: 'foreign key',
      name: 'fk_config_products_center_dia_clarity_id',
      references: {
        table: 'clarities',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_products', 'fk_config_products_center_dia_clarity_id');
  }
};
