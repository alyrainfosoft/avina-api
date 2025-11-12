
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('role_permission_accesses', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_role_permission_accesses_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('role_permission_accesses', 'fk_role_permission_accesses_created_by');
  }
};
