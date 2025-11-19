
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('setting_styles', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_setting_styles_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('setting_styles', 'fk_setting_styles_modified_by');
  }
};
