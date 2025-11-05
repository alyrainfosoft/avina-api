
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_images', {
      fields: ['id_product'],
      type: 'foreign key',
      name: 'fk_product_images_id_product',
      references: {
        table: 'products',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_images', 'fk_product_images_id_product');
  }
};
