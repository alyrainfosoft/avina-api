
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('mega_menu_attributes', {
      fields: ['id_metal_tone'],
      type: 'foreign key',
      name: 'fk_mega_menu_attributes_id_metal_tone',
      references: {
        table: 'metal_tones',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('mega_menu_attributes', 'fk_mega_menu_attributes_id_metal_tone');
  }
};
