
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('pages', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_pages_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('pages', 'fk_pages_created_by');
  }
};
