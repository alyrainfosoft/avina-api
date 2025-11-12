
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('side_setting_styles', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_side_setting_styles_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('side_setting_styles', 'fk_side_setting_styles_created_by');
  }
};
