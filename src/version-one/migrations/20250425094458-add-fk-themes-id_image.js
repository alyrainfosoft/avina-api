
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('themes', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_themes_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('themes', 'fk_themes_id_image');
  }
};
