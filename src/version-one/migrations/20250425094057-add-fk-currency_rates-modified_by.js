
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('currency_rates', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_currency_rates_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('currency_rates', 'fk_currency_rates_modified_by');
  }
};
