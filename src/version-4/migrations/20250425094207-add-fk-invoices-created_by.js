
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('invoices', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_invoices_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('invoices', 'fk_invoices_created_by');
  }
};
