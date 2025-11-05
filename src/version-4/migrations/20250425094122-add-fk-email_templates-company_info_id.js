
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('email_templates', {
      fields: ['company_info_id'],
      type: 'foreign key',
      name: 'fk_email_templates_company_info_id',
      references: {
        table: 'company_infoes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('email_templates', 'fk_email_templates_company_info_id');
  }
};
