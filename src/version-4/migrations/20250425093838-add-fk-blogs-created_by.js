
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('blogs', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_blogs_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('blogs', 'fk_blogs_created_by');
  }
};
