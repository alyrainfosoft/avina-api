
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('metal_tones', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_metal_tones_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('metal_tones', 'fk_metal_tones_id_image');
  }
};
