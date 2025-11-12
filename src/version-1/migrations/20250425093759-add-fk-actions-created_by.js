
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('actions', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_actions_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('actions', 'fk_actions_created_by');
  }
};
