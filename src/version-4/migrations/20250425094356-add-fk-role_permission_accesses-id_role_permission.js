
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('role_permission_accesses', {
      fields: ['id_role_permission'],
      type: 'foreign key',
      name: 'fk_role_permission_accesses_id_role_permission',
      references: {
        table: 'role_permissions',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('role_permission_accesses', 'fk_role_permission_accesses_id_role_permission');
  }
};
