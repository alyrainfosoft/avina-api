
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('home_subs', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_home_subs_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('home_subs', 'fk_home_subs_id_image');
  }
};
