
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_enquiries', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_product_enquiries_product_id',
      references: {
        table: 'products',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_enquiries', 'fk_product_enquiries_product_id');
  }
};
