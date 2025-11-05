
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('heads', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_heads_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('heads', 'fk_heads_id_image');
  }
};
