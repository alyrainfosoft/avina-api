
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('side_setting_styles', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_side_setting_styles_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('side_setting_styles', 'fk_side_setting_styles_id_image');
  }
};
