
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('blog_categories', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_blog_categories_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('blog_categories', 'fk_blog_categories_created_by');
  }
};
