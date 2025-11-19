
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_images', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_product_images_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_images', 'fk_product_images_modified_by');
  }
};
