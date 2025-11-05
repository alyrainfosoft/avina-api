
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('wishlist_products', {
      fields: ['id_band_metal_tone'],
      type: 'foreign key',
      name: 'fk_wishlist_products_id_band_metal_tone',
      references: {
        table: 'metal_tones',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('wishlist_products', 'fk_wishlist_products_id_band_metal_tone');
  }
};
