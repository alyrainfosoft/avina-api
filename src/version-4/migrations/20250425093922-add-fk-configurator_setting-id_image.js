
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('configurator_setting', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_configurator_setting_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('configurator_setting', 'fk_configurator_setting_id_image');
  }
};
