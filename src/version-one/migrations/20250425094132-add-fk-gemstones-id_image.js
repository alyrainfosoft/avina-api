
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gemstones', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_gemstones_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gemstones', 'fk_gemstones_id_image');
  }
};
