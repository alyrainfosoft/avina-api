
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('banners', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_banners_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('banners', 'fk_banners_id_image');
  }
};
