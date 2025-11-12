
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('template_banners', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_template_banners_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('template_banners', 'fk_template_banners_id_image');
  }
};
