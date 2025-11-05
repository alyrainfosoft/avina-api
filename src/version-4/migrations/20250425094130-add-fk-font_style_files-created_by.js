
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('font_style_files', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_font_style_files_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('font_style_files', 'fk_font_style_files_created_by');
  }
};
