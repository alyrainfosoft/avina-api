
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('hook_types', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_hook_types_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('hook_types', 'fk_hook_types_modified_by');
  }
};
