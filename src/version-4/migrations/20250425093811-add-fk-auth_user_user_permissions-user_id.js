
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('auth_user_user_permissions', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_auth_user_user_permissions_user_id',
      references: {
        table: 'auth_user',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('auth_user_user_permissions', 'fk_auth_user_user_permissions_user_id');
  }
};
