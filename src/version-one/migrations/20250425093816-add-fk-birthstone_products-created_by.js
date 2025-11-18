
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('birthstone_products', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_birthstone_products_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('birthstone_products', 'fk_birthstone_products_created_by');
  }
};
