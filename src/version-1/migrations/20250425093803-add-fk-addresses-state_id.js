
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('addresses', {
      fields: ['state_id'],
      type: 'foreign key',
      name: 'fk_addresses_state_id',
      references: {
        table: 'states',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('addresses', 'fk_addresses_state_id');
  }
};
