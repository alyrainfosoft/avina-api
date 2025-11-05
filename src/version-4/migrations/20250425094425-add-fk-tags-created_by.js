
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('tags', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_tags_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('tags', 'fk_tags_created_by');
  }
};
