
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('clarities', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_clarities_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('clarities', 'fk_clarities_modified_by');
  }
};
