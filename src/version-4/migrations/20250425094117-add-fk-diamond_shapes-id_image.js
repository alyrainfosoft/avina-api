
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('diamond_shapes', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_diamond_shapes_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('diamond_shapes', 'fk_diamond_shapes_id_image');
  }
};
