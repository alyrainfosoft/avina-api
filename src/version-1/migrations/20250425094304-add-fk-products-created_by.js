
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('products', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_products_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('products', 'fk_products_created_by');
  }
};
