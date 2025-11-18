
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('auth_permission', {
      fields: ['content_type_id'],
      type: 'foreign key',
      name: 'fk_auth_permission_content_type_id',
      references: {
        table: 'django_content_type',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('auth_permission', 'fk_auth_permission_content_type_id');
  }
};
