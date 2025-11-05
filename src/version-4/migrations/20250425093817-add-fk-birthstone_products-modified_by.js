
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('birthstone_products', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_birthstone_products_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('birthstone_products', 'fk_birthstone_products_modified_by');
  }
};
