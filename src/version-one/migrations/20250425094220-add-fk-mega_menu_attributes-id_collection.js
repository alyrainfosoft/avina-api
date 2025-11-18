
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('mega_menu_attributes', {
      fields: ['id_collection'],
      type: 'foreign key',
      name: 'fk_mega_menu_attributes_id_collection',
      references: {
        table: 'collections',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('mega_menu_attributes', 'fk_mega_menu_attributes_id_collection');
  }
};
