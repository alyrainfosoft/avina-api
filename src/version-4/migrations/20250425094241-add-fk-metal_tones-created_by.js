
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('metal_tones', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_metal_tones_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('metal_tones', 'fk_metal_tones_created_by');
  }
};
