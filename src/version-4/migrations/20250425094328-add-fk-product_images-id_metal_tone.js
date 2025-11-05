
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_images', {
      fields: ['id_metal_tone'],
      type: 'foreign key',
      name: 'fk_product_images_id_metal_tone',
      references: {
        table: 'metal_tones',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_images', 'fk_product_images_id_metal_tone');
  }
};
