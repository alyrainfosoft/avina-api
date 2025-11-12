
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('django_admin_log', {
      fields: ['content_type_id'],
      type: 'foreign key',
      name: 'fk_django_admin_log_content_type_id',
      references: {
        table: 'django_content_type',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('django_admin_log', 'fk_django_admin_log_content_type_id');
  }
};
