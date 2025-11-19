
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('auth_group_permissions', {
      fields: ['group_id'],
      type: 'foreign key',
      name: 'fk_auth_group_permissions_group_id',
      references: {
        table: 'auth_group',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('auth_group_permissions', 'fk_auth_group_permissions_group_id');
  }
};
