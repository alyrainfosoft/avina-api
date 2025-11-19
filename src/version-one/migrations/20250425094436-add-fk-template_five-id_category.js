
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('template_five', {
      fields: ['id_category'],
      type: 'foreign key',
      name: 'fk_template_five_id_category',
      references: {
        table: 'categories',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('template_five', 'fk_template_five_id_category');
  }
};
