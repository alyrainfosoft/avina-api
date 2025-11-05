
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('shanks', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_shanks_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('shanks', 'fk_shanks_created_by');
  }
};
