
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('enquiries', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_enquiries_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('enquiries', 'fk_enquiries_created_by');
  }
};
