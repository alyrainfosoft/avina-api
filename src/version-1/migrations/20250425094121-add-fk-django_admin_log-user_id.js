
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('django_admin_log', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_django_admin_log_user_id',
      references: {
        table: 'auth_user',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('django_admin_log', 'fk_django_admin_log_user_id');
  }
};
