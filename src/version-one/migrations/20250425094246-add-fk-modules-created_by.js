
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('modules', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_modules_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('modules', 'fk_modules_created_by');
  }
};
