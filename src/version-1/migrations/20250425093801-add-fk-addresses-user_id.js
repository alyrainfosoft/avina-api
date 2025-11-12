
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('addresses', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_addresses_user_id',
      references: {
        table: 'customer_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('addresses', 'fk_addresses_user_id');
  }
};
