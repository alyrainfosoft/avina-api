
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('categories', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_categories_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('categories', 'fk_categories_created_by');
  }
};
