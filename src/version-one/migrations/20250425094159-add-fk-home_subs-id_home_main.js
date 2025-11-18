
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('home_subs', {
      fields: ['id_home_main'],
      type: 'foreign key',
      name: 'fk_home_subs_id_home_main',
      references: {
        table: 'home_about_mains',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('home_subs', 'fk_home_subs_id_home_main');
  }
};
