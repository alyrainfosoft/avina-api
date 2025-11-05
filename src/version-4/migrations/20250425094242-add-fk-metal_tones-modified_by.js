
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('metal_tones', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_metal_tones_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('metal_tones', 'fk_metal_tones_modified_by');
  }
};
