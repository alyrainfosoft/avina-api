
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('company_infoes', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_company_infoes_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('company_infoes', 'fk_company_infoes_modified_by');
  }
};
