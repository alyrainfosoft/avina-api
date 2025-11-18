
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('mega_menu_attributes', {
      fields: ['id_setting_type'],
      type: 'foreign key',
      name: 'fk_mega_menu_attributes_id_setting_type',
      references: {
        table: 'setting_styles',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('mega_menu_attributes', 'fk_mega_menu_attributes_id_setting_type');
  }
};
