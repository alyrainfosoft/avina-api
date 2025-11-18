
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('shipping_charges', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_shipping_charges_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('shipping_charges', 'fk_shipping_charges_created_by');
  }
};
