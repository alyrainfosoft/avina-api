
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('about_us', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_about_us_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('about_us', 'fk_about_us_modified_by');
  }
};
