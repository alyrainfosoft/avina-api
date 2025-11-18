
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('company_infoes', {
      fields: ['light_id_image'],
      type: 'foreign key',
      name: 'fk_company_infoes_light_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('company_infoes', 'fk_company_infoes_light_id_image');
  }
};
