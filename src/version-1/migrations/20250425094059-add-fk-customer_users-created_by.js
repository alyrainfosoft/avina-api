
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('customer_users', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_customer_users_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('customer_users', 'fk_customer_users_created_by');
  }
};
