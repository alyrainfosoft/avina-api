
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('our_stories', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_our_stories_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('our_stories', 'fk_our_stories_modified_by');
  }
};
