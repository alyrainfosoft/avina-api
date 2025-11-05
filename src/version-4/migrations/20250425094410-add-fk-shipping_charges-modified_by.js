
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('shipping_charges', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_shipping_charges_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('shipping_charges', 'fk_shipping_charges_modified_by');
  }
};
