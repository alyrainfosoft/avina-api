
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('mega_menus', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_mega_menus_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('mega_menus', 'fk_mega_menus_modified_by');
  }
};
