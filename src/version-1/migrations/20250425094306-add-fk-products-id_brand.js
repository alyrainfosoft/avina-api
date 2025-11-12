
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('products', {
      fields: ['id_brand'],
      type: 'foreign key',
      name: 'fk_products_id_brand',
      references: {
        table: 'brands',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('products', 'fk_products_id_brand');
  }
};
