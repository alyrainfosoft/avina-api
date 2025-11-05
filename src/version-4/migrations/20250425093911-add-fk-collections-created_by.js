
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('collections', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_collections_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('collections', 'fk_collections_created_by');
  }
};
