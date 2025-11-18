
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('filters', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_filters_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('filters', 'fk_filters_created_by');
  }
};
