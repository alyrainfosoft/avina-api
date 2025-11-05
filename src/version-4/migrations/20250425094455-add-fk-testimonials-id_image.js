
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('testimonials', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_testimonials_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('testimonials', 'fk_testimonials_id_image');
  }
};
