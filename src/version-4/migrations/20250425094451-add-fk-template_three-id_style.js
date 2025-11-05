
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('template_three', {
      fields: ['id_style'],
      type: 'foreign key',
      name: 'fk_template_three_id_style',
      references: {
        table: 'setting_styles',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('template_three', 'fk_template_three_id_style');
  }
};
