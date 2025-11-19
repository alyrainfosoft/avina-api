
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('contries', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_contries_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('contries', 'fk_contries_modified_by');
  }
};
