
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('home_subs', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_home_subs_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('home_subs', 'fk_home_subs_created_by');
  }
};
