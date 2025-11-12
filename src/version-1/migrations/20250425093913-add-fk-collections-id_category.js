
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('collections', {
      fields: ['id_category'],
      type: 'foreign key',
      name: 'fk_collections_id_category',
      references: {
        table: 'categories',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('collections', 'fk_collections_id_category');
  }
};
