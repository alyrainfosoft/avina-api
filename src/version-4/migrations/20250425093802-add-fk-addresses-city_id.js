
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('addresses', {
      fields: ['city_id'],
      type: 'foreign key',
      name: 'fk_addresses_city_id',
      references: {
        table: 'cities',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('addresses', 'fk_addresses_city_id');
  }
};
