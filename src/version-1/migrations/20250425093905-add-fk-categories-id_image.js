
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('categories', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_categories_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('categories', 'fk_categories_id_image');
  }
};
