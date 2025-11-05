
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gift_set_product_images', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_gift_set_product_images_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gift_set_product_images', 'fk_gift_set_product_images_modified_by');
  }
};
