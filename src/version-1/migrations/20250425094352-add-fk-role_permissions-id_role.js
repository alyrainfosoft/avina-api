
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('role_permissions', {
      fields: ['id_role'],
      type: 'foreign key',
      name: 'fk_role_permissions_id_role',
      references: {
        table: 'roles',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('role_permissions', 'fk_role_permissions_id_role');
  }
};
