
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('carat_sizes', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_carat_sizes_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('carat_sizes', 'fk_carat_sizes_id_image');
  }
};
