
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('role_permission_accesses', {
      fields: ['id_action'],
      type: 'foreign key',
      name: 'fk_role_permission_accesses_id_action',
      references: {
        table: 'actions',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('role_permission_accesses', 'fk_role_permission_accesses_id_action');
  }
};
