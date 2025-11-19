
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('module_items', {
      fields: ['id_module'],
      type: 'foreign key',
      name: 'fk_module_items_id_module',
      references: {
        table: 'modules',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('module_items', 'fk_module_items_id_module');
  }
};
