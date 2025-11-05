
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('filters', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_filters_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('filters', 'fk_filters_modified_by');
  }
};
