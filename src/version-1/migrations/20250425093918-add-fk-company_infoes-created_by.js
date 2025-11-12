
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('company_infoes', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_company_infoes_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('company_infoes', 'fk_company_infoes_created_by');
  }
};
