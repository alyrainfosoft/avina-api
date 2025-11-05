
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('shanks', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_shanks_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('shanks', 'fk_shanks_modified_by');
  }
};
