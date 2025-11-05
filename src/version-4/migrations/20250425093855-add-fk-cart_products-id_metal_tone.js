
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('cart_products', {
      fields: ['id_metal_tone'],
      type: 'foreign key',
      name: 'fk_cart_products_id_metal_tone',
      references: {
        table: 'metal_tones',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('cart_products', 'fk_cart_products_id_metal_tone');
  }
};
