
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('our_stories', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_our_stories_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('our_stories', 'fk_our_stories_id_image');
  }
};
