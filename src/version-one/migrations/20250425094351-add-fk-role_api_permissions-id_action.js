
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('role_api_permissions', {
      fields: ['id_action'],
      type: 'foreign key',
      name: 'fk_role_api_permissions_id_action',
      references: {
        table: 'actions',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('role_api_permissions', 'fk_role_api_permissions_id_action');
  }
};
