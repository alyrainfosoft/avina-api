
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('static_pages', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_static_pages_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('static_pages', 'fk_static_pages_created_by');
  }
};
