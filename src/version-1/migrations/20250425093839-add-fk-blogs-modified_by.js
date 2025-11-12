
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('blogs', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_blogs_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('blogs', 'fk_blogs_modified_by');
  }
};
