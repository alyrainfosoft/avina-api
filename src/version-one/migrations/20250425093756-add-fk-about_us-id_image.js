
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('about_us', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_about_us_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('about_us', 'fk_about_us_id_image');
  }
};
