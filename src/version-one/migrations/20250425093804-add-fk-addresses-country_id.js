
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('addresses', {
      fields: ['country_id'],
      type: 'foreign key',
      name: 'fk_addresses_country_id',
      references: {
        table: 'contries',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('addresses', 'fk_addresses_country_id');
  }
};
