
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('template_six', {
      fields: ['id_product'],
      type: 'foreign key',
      name: 'fk_template_six_id_product',
      references: {
        table: 'products',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('template_six', 'fk_template_six_id_product');
  }
};
