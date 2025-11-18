
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('colors', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_colors_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('colors', 'fk_colors_modified_by');
  }
};
