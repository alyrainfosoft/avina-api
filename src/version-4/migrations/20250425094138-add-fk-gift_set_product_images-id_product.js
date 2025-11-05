
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gift_set_product_images', {
      fields: ['id_product'],
      type: 'foreign key',
      name: 'fk_gift_set_product_images_id_product',
      references: {
        table: 'gift_set_products',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gift_set_product_images', 'fk_gift_set_product_images_id_product');
  }
};
