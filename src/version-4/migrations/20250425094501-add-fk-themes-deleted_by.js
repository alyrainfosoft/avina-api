
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('themes', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_themes_deleted_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('themes', 'fk_themes_deleted_by');
  }
};
