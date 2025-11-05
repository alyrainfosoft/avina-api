
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('states', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_states_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('states', 'fk_states_modified_by');
  }
};
