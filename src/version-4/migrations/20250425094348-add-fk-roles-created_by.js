
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('roles', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_roles_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('roles', 'fk_roles_created_by');
  }
};
