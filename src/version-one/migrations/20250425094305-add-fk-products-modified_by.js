
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('products', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_products_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('products', 'fk_products_modified_by');
  }
};
