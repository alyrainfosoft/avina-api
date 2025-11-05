
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('theme_attribute_customers', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_theme_attribute_customers_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('theme_attribute_customers', 'fk_theme_attribute_customers_created_by');
  }
};
