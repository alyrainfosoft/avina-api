
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('home_subs', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_home_subs_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('home_subs', 'fk_home_subs_modified_by');
  }
};
