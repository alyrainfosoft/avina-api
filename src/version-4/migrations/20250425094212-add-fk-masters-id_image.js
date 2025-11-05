
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('masters', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_masters_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('masters', 'fk_masters_id_image');
  }
};
