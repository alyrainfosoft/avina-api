
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('auth_user_user_permissions', {
      fields: ['permission_id'],
      type: 'foreign key',
      name: 'fk_auth_user_user_permissions_permission_id',
      references: {
        table: 'auth_permission',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('auth_user_user_permissions', 'fk_auth_user_user_permissions_permission_id');
  }
};
