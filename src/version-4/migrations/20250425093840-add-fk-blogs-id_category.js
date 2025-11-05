
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('blogs', {
      fields: ['id_category'],
      type: 'foreign key',
      name: 'fk_blogs_id_category',
      references: {
        table: 'blog_categories',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('blogs', 'fk_blogs_id_category');
  }
};
