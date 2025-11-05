
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('theme_attribute_customers', {
      fields: ['id_company_info'],
      type: 'foreign key',
      name: 'fk_theme_attribute_customers_id_company_info',
      references: {
        table: 'company_infoes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('theme_attribute_customers', 'fk_theme_attribute_customers_id_company_info');
  }
};
