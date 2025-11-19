
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('business_users', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_business_users_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('business_users', 'fk_business_users_modified_by');
  }
};
