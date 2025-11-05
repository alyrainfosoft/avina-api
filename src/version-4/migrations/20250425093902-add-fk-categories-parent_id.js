
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('categories', {
      fields: ['parent_id'],
      type: 'foreign key',
      name: 'fk_categories_parent_id',
      references: {
        table: 'categories',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('categories', 'fk_categories_parent_id');
  }
};
