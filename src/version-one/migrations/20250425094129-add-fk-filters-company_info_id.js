
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('filters', {
      fields: ['company_info_id'],
      type: 'foreign key',
      name: 'fk_filters_company_info_id',
      references: {
        table: 'company_infoes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('filters', 'fk_filters_company_info_id');
  }
};
