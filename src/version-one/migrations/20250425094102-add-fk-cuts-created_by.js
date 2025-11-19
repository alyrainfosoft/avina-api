
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('cuts', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_cuts_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('cuts', 'fk_cuts_created_by');
  }
};
