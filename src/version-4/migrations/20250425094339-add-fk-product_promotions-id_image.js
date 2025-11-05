
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_promotions', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_product_promotions_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_promotions', 'fk_product_promotions_id_image');
  }
};
