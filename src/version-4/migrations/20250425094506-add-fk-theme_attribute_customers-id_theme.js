
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('theme_attribute_customers', {
      fields: ['id_theme'],
      type: 'foreign key',
      name: 'fk_theme_attribute_customers_id_theme',
      references: {
        table: 'themes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('theme_attribute_customers', 'fk_theme_attribute_customers_id_theme');
  }
};
