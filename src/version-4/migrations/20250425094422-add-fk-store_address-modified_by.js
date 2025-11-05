
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('store_address', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_store_address_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('store_address', 'fk_store_address_modified_by');
  }
};
