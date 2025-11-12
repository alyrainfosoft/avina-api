
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('template_five', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_template_five_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('template_five', 'fk_template_five_modified_by');
  }
};
