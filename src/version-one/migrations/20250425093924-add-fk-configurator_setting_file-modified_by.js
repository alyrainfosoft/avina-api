
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('configurator_setting_file', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_configurator_setting_file_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('configurator_setting_file', 'fk_configurator_setting_file_modified_by');
  }
};
