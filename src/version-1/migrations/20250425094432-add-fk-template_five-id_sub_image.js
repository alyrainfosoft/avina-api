
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('template_five', {
      fields: ['id_sub_image'],
      type: 'foreign key',
      name: 'fk_template_five_id_sub_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('template_five', 'fk_template_five_id_sub_image');
  }
};
