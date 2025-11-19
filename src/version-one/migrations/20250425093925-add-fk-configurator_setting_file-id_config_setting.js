
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('configurator_setting_file', {
      fields: ['id_config_setting'],
      type: 'foreign key',
      name: 'fk_configurator_setting_file_id_config_setting',
      references: {
        table: 'configurator_setting',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('configurator_setting_file', 'fk_configurator_setting_file_id_config_setting');
  }
};
