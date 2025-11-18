
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gift_set_products', {
      fields: ['brand_id'],
      type: 'foreign key',
      name: 'fk_gift_set_products_brand_id',
      references: {
        table: 'brands',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gift_set_products', 'fk_gift_set_products_brand_id');
  }
};
