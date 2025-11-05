
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('shanks', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_shanks_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('shanks', 'fk_shanks_id_image');
  }
};
