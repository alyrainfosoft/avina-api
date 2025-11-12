
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('role_permissions', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_role_permissions_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('role_permissions', 'fk_role_permissions_modified_by');
  }
};
